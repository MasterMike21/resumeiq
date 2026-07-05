import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  extractedText: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Resume', resumeSchema);