import express from 'express';
import UserGoals from '../models/UserGoals.js';
import Wishlist from '../models/Wishlist.js';
import Book from '../models/Book.js';
import ReadingActivity from '../models/ReadingActivity.js';

const router = express.Router();

// Get goals and streaks
router.get('/', async (req, res) => {
  try {
    let goals = await UserGoals.findOne({});
    if (!goals) {
      goals = await UserGoals.create({});
    }
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update goals
router.put('/', async (req, res) => {
  try {
    const goals = await UserGoals.findOneAndUpdate({}, req.body, { upsert: true, new: true });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- WISHLIST / BUY LIST ---

router.get('/wishlist', async (req, res) => {
  try {
    const items = await Wishlist.find({ purchased: false }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/wishlist', async (req, res) => {
  try {
    const newItem = new Wishlist(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark as purchased and move to Library
router.post('/wishlist/:id/purchase', async (req, res) => {
  try {
    const item = await Wishlist.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Move to Books as To-Be-Read
    const newBook = new Book({
      title: item.title,
      author: item.author,
      coverImage: item.coverImage,
      genre: item.genre,
      status: 'To-Read',
      progress: {
        totalPages: item.totalPages || 0,
        readPages: 0
      }
    });
    await newBook.save();

    // Mark as purchased or delete from wishlist
    item.purchased = true;
    await item.save();

    res.json({ message: 'Book moved to Library!', book: newBook });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/wishlist/:id', async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
