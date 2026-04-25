import express from 'express';
import Book from '../models/Book.js';
import Review from '../models/Review.js';
import Wishlist from '../models/Wishlist.js';
import ReadingActivity from '../models/ReadingActivity.js';
import UserGoals from '../models/UserGoals.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// --- BOOKS ---

import axios from 'axios';

// Proxy search to Google Books API
router.get('/search', async (req, res) => {
  const { title, author } = req.query;
  try {
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${title}+inauthor:${author}&maxResults=1`);
    if (!response.data.items) return res.status(404).json({ message: 'No book found' });
    
    const info = response.data.items[0].volumeInfo;
    res.json({
      title: info.title,
      authors: info.authors?.join(', '),
      publisher: info.publisher,
      pageCount: info.pageCount,
      coverImg: info.imageLinks?.thumbnail?.replace('http://', 'https://'),
      genre: info.categories?.[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all books for a user
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({}).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new book
router.post('/', async (req, res) => {
  try {
    const newBook = new Book({
      ...req.body
    });
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a book
router.put('/:id', async (req, res) => {
  try {
    const existingBook = await Book.findById(req.params.id);
    if (!existingBook) return res.status(404).json({ message: 'Book not found' });

    const oldPages = existingBook.progress?.readPages || 0;
    const newPages = req.body.progress?.readPages;

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });

    // Sync to ReadingActivity and UserGoals if pages increased
    if (newPages !== undefined && newPages > oldPages) {
      const todayDate = new Date().toISOString().split('T')[0];
      const pagesDiff = newPages - oldPages;
      
      // Activity
      let activity = await ReadingActivity.findOne({ date: todayDate, bookId: book._id });
      if (activity) {
        activity.pagesRead += pagesDiff;
        activity.count += 1;
        await activity.save();
      } else {
        await ReadingActivity.create({
          date: todayDate,
          bookId: book._id,
          pagesRead: pagesDiff,
          count: 1
        });
      }

      // Goals & Streaks
      let goals = await UserGoals.findOne({});
      if (!goals) goals = await UserGoals.create({});
      
      const lastUpdate = goals.lastPageUpdate ? goals.lastPageUpdate.toISOString().split('T')[0] : null;
      
      if (lastUpdate === todayDate) {
        goals.todayPagesRead += pagesDiff;
      } else {
        // New day - check if yesterday goal was met
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastUpdate === yesterdayStr && goals.todayPagesRead >= goals.dailyPageGoal) {
          goals.currentStreak += 1;
        } else if (lastUpdate !== yesterdayStr) {
          goals.currentStreak = 0; // Streak broken
        }
        
        goals.todayPagesRead = pagesDiff;
        goals.lastPageUpdate = new Date();
      }

      // Milestone Check
      if (goals.todayPagesRead >= 100 && !goals.milestones.find(m => m.name === 'Century Club')) {
        goals.milestones.push({ name: 'Century Club' });
      }
      if (goals.currentStreak >= 7 && !goals.milestones.find(m => m.name === 'Consistency King')) {
        goals.milestones.push({ name: 'Consistency King' });
      }

      await goals.save();
    }

    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if review exists for a book
router.get('/check-review/:bookId', async (req, res) => {
  try {
    const review = await Review.findOne({ book: req.params.bookId });
    if (review) {
      return res.json({ exists: true, reviewId: review._id });
    }
    return res.json({ exists: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    // Cascade Delete: Also delete associated reviews and activities
    await ReadingActivity.deleteMany({ bookId: req.params.id });
    await Review.deleteMany({ book: req.params.id });
    res.json({ message: 'Book and associated data deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- REVIEWS ---

// Get review for a book
router.get('/:bookId/review', async (req, res) => {
  try {
    const review = await Review.findOne({ book: req.params.bookId });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/Update review for a book
router.post('/:bookId/review', async (req, res) => {
  try {
    let review = await Review.findOne({ book: req.params.bookId });
    if (review) {
      review = await Review.findByIdAndUpdate(review._id, req.body, { returnDocument: 'after' });
    } else {
      review = new Review({
        ...req.body,
        book: req.params.bookId
      });
      await review.save();
    }
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- WISHLIST ---
// Just mount wishlist directly here or on another route.
router.get('/wishlist/all', async (req, res) => {
  try {
    const items = await Wishlist.find({}).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/wishlist/add', async (req, res) => {
  try {
    const newItem = new Wishlist({
      ...req.body
    });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/wishlist/:id', async (req, res) => {
  try {
    const item = await Wishlist.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { returnDocument: 'after' }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
