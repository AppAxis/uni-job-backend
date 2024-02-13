import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const jobOfferSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
   //full time or intern
  employment: {
    type: String,
    required: true,
  },
  jobLocation: {
    type: String,
  },
  salary: {
    type: Number,
  },
  postedOn: {
    type: Date,
    default: Date.now,
},
  beginning_date: {
    type: Date,
  },
  requirements: {
    type: [String],
  },
  description: {
    type: String,
    required:true,
  },
  type: {
    type: String,
    enum: ['CDD', 'CDI', 'Freelance', 'Part-time', 'Full-time', 'Remote'],
  },
  job_responsibilities: {
    type: [String],
  },
//information of recruiter that has posted the job
postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
},
/*appliedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
    },
  ],*/

appliedBy: [
    //array containing information of seekers who have applied
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobSeeker',
    },
],
},
{
  timestamps: true,
});

const JobOffer = model('JobOffer', jobOfferSchema);

export default JobOffer;