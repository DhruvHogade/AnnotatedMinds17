import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import bookRoutes from './routes/books.js';
import reviewRoutes from './routes/reviews.js';
import dashboardRoutes from './routes/dashboard.js';
import quoteRoutes from './routes/quotes.js';
import goalRoutes from './routes/goals.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/goals', goalRoutes);

// Diagnostics for Render
import fs from 'fs';
const clientDistPath = path.resolve(__dirname, '../client/dist');
console.log('__dirname:', __dirname);
console.log('Looking for client/dist at:', clientDistPath);
if (fs.existsSync(clientDistPath)) {
  console.log('client/dist found!');
  console.log('Contents:', fs.readdirSync(clientDistPath));
} else {
  console.log('client/dist NOT found!');
  // Try checking the parent directory
  const parentPath = path.resolve(__dirname, '..');
  console.log('Parent directory contents:', fs.readdirSync(parentPath));
}

// Serve static files from the React app
app.use(express.static(clientDistPath));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
