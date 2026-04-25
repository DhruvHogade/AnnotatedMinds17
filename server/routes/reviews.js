import express from 'express';
import Review from '../models/Review.js';
import Book from '../models/Book.js';

const router = express.Router();

router.get('/fetch-metadata', async (req, res) => {
  try {
    const { title, author } = req.query;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    let query = `intitle:${title}`;
    if (author) query += `+inauthor:${author}`;
    
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const bookInfo = data.items[0].volumeInfo;
      return res.status(200).json({
        coverImageUrl: bookInfo.imageLinks?.thumbnail || '',
        publisher: bookInfo.publisher || '',
        pageCount: bookInfo.pageCount || 0,
      });
    } else {
      return res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ message: 'Failed to fetch book metadata' });
  }
});

// Create a new review
router.post('/', async (req, res) => {
  try {
    let bookId = req.body.book;
    
    // Ensure the book exists and its status is synchronized to 'Finished'
    if (bookId) {
      await Book.findByIdAndUpdate(bookId, { status: 'Finished' });
    } else {
      // Direct review creation - try to find matching book or create new one in library
      const book = await Book.findOneAndUpdate(
        { title: req.body.title, author: req.body.author },
        { 
          $set: {
            title: req.body.title,
            author: req.body.author,
            status: 'Finished',
            coverImage: req.body.coverImageUrl,
            genre: req.body.genre,
            'progress.totalPages': req.body.pageCount || 0,
            'progress.readPages': req.body.pageCount || 0
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      bookId = book._id;
    }

    const newReview = new Review({ ...req.body, book: bookId });
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
});

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
});

// Get single review by ID
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching review', error: error.message });
  }
});

// Update review by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!updatedReview) return res.status(404).json({ message: 'Review not found' });
    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

// Delete review by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) return res.status(404).json({ message: 'Review not found' });
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

export default router;
