import express from 'express';
import Book from '../models/Book.js';
import Review from '../models/Review.js';
import UserGoals from '../models/UserGoals.js';
import Wishlist from '../models/Wishlist.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const goals = await UserGoals.findOne({});
    const bucketList = await Wishlist.find({ purchased: false }).sort({ createdAt: -1 }).limit(10);
    const stats = await Book.aggregate([
      { $unionWith: { coll: "reviews" } },
      {
        $facet: {
          readingNow: [
            { $match: { status: 'Currently Reading' } },
            { $sort: { updatedAt: -1 } },
            { $project: { title: 1, author: 1, coverImage: 1, progress: 1, updatedAt: 1 } }
          ],
          yearlyCount: [
            { $match: { status: 'Finished' } },
            { $count: 'count' }
          ],
          activityLog: [
            { $limit: 1 },
            { $lookup: {
                from: "readingactivities",
                pipeline: [
                  { $group: { _id: "$date", count: { $sum: "$count" } } },
                  { $project: { _id: 0, date: "$_id", count: 1 } }
                ],
                as: "activities"
            }},
            { $unwind: "$activities" },
            { $replaceRoot: { newRoot: "$activities" } }
          ],
          recentLog: [
            { $match: { overallRating: { $exists: true } } }, // Identifies reviews
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            { $project: { _id: 1, title: 1, author: 1, overallRating: 1, createdAt: 1, recommendation: 1 } }
          ],
          favoriteQuotes: [
            { $match: { "favoriteQuotes.0": { $exists: true } } },
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            { $project: { title: 1, author: 1, favoriteQuotes: 1 } }
          ]
        }
      }
    ]);

    const result = stats[0];
    const booksFinished = result.yearlyCount.length > 0 ? result.yearlyCount[0].count : 0;

    // Flatten quotes for frontend
    let flatQuotes = [];
    result.favoriteQuotes.forEach(review => {
      review.favoriteQuotes.forEach(quote => {
        if (quote.text) {
          flatQuotes.push({
            bookTitle: review.title,
            author: review.author,
            text: quote.text,
            pageNumber: quote.pageNumber
          });
        }
      });
    });

    res.json({
      readingNow: result.readingNow,
      booksFinished: booksFinished,
      activityMap: result.activityLog,
      recentLogs: result.recentLog,
      favoriteQuotes: flatQuotes,
      goals: goals || { yearlyBookGoal: 24, dailyPageGoal: 30, currentStreak: 0, milestones: [] },
      bucketList: bucketList || []
    });

  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
