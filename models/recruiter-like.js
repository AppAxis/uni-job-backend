import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const likesSchema = new Schema(
  {
    recruiter_id: {
      type: Schema.Types.ObjectId,
      ref: 'Recruiter',
    },
    jobSeeker_id: {
      type: Schema.Types.ObjectId,
      ref: 'JobSeeker',
    },
    isLike: {
      type: Boolean,
      required: true,
    },
    
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    isSuper: {
      type: Boolean,
      default: false,
    },
    // recruiter like the candidate profile
    message: {
      type: String,
    },
    dateLiked: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Likes = model('Likes', likesSchema);

export default Likes;