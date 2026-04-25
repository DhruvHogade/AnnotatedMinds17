import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['To-Read', 'Currently Reading', 'Finished'],
    default: 'To-Read',
  },
  progress: {
    readPages: { type: Number, default: 0 },
    totalPages: { type: Number, default: 0 },
  },
  category: {
    type: String,
  },
  genre: {
    type: String,
  },
  seriesTracker: {
    seriesName: { type: String, default: '' },
    bookNumber: { type: Number, default: null },
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);
