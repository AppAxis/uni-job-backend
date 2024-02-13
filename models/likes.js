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
    status: {
      type: String,
     // enum: ['liked', 'disliked'],
      //default: 'liked',
    },
    isSuper: {
      type: Boolean,
      default: false,
    },
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