import express from 'express';
import Quote from '../models/Quote.js';

const router = express.Router();

// Get all quotes
router.get('/', async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a quote
router.post('/', async (req, res) => {
  try {
    const { text, author, bookTitle, pageNumber, tags } = req.body;
    const newQuote = new Quote({
      text,
      author,
      bookTitle,
      pageNumber,
      tags
    });
    const savedQuote = await newQuote.save();
    res.status(201).json(savedQuote);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a quote
router.delete('/:id', async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quote deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
