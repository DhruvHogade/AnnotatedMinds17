import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  coverImage: { type: String },
  genre: { type: String },
  totalPages: { type: Number },
  expectedPrice: { type: Number, default: 0 },
  buyLink: { type: String },
  purchased: { type: Boolean, default: false },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

export default mongoose.model('Wishlist', wishlistSchema);
