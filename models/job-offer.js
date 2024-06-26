import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const jobOfferSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  

  jobLocation: {
    lat: {
      type: Number,
    },
    long: {
      type: Number,
    },
    address:{
      type: String,
    }
  },
  salary: {
    type: Number,
  },
  postedOn: {
    type: Date,
    default: Date.now,
  },
  beginningDate: {
    type: Date,
  },
  // Add closing date for application deadline
  closingDate: {
    type: Date,
  },
  // Add maximum number of applications
  maxApplications: {
    type: Number,
  },
  requirements: {
    type: [String],
  },
  description: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    enum: ['CDD', 'CDI', 'freelance', 'partTime', 'fullTime', 'remote', 'alternation','internship']
  },
  jobDomain: {
    type: String,
  },
  job_responsibilities: {
    type: [String],
  },
  // information of recruiter that has posted the job
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
  },
  appliedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
    },
  ],
  passBy: [
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