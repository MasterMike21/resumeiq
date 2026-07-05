import mongoose from 'mongoose';

const analysisReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  atsScore: { type: Number, required: true },
  breakdown: {
    contactInfo: Number,
    skills: Number,
    education: Number,
    experience: Number,
    projects: Number,
    keywords: Number
  },
  suggestions: [String],
  skillGap: [String],
  recommendedRoles: [String]
}, { timestamps: true });

export default mongoose.model('AnalysisReport', analysisReportSchema);