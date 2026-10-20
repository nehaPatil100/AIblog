import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name zaroori hai'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email zaroori hai'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email daalo'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    bio: { type: String, default: '', maxlength: 300 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hash(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toPublic = function toPublic() {
  return { id: this._id, name: this.name, email: this.email, bio: this.bio, role: this.role };
};

export default mongoose.model('User', userSchema);
