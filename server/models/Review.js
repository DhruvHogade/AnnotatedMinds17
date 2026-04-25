import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // Basic Info
  title: { type: String, required: true },
  author: { type: String, required: true },
  publisher: { type: String },
  pageCount: { type: Number },
  genre: { type: String },
  format: { type: String, enum: ['Hardcover', 'Paperback', 'E-Book', 'Audio'] },
  
  // Discovery
  discoveryMethod: { type: String },
  acquisitionSource: { type: String },
  readLocation: { type: String },
  
  // Author Context
  otherBooksByAuthor: [{ type: String }],
  
  // Metrics (0-10)
  characterDevelopment: { type: Number, min: 0, max: 10 },
  plotDevelopment: { type: Number, min: 0, max: 10 },
  qualityOfWriting: { type: Number, min: 0, max: 10 },
  pacing: { type: Number, min: 0, max: 10 },
  thoughtProvoking: { type: Number, min: 0, max: 10 },
  entertaining: { type: Number, min: 0, max: 10 },
  enjoyable: { type: Number, min: 0, max: 10 },
  
  // Detailed Content
  recommendation: { type: String, enum: ['Yes', 'No'] },
  overallRating: { type: Number, min: 0, max: 5 },
  detailedReview: { type: String },
  favoriteQuotes: [{ 
    text: { type: String }, 
    pageNumber: { type: String } 
  }],
  
  // Dates
  startDate: { type: String },
  endDate: { type: String },

  // Images
  coverImageUrl: { type: String },
  moodboardImages: [{ type: String }],
  
  // Emoji Stats
  emojiStats: [{
    emoji: { type: String },
    percentage: { type: Number }
  }],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
