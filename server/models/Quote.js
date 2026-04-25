import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String },
  bookTitle: { type: String },
  pageNumber: { type: String },
  tags: [{ type: String }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export default mongoose.model('Quote', quoteSchema);
