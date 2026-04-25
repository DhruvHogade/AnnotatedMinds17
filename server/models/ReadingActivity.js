import mongoose from 'mongoose';

const readingActivitySchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  pagesRead: { type: Number, default: 0 },
  count: { type: Number, default: 1 } // Number of updates for the day
}, { timestamps: true });

export default mongoose.model('ReadingActivity', readingActivitySchema);
