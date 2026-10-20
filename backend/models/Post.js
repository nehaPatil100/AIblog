import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title zaroori hai'], trim: true, maxlength: 150 },
    slug: { type: String, unique: true, index: true },
    content: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    summary: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Post', postSchema);
