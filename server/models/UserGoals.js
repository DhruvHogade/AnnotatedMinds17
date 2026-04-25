import mongoose from 'mongoose';

const userGoalsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  yearlyBookGoal: { type: Number, default: 24 },
  dailyPageGoal: { type: Number, default: 30 },
  currentStreak: { type: Number, default: 0 },
  lastPageUpdate: { type: Date },
  todayPagesRead: { type: Number, default: 0 },
  milestones: [{
    name: { type: String },
    dateAwarded: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('UserGoals', userGoalsSchema);
