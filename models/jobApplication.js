import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const jobApplicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'JobOffer',
    },
    jobSeeker: {
      type: Schema.Types.ObjectId,
      ref: 'JobSeeker',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    isSuper:{
        type: Boolean,
        default:false,  
    },
    message:{
        type:String,
    },
    dateOfApplication:{
        type:Date,
        default: Date.now(),
    }
  },
  {
    timestamps: true,
  }
);

const JobApplication = model('JobApplication', jobApplicationSchema);

export default JobApplication;