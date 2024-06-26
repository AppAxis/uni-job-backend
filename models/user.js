import mongoose from 'mongoose';
import validator from 'validator';

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
   
    },
    email: {
      type: String,
      required: [true, 'Email field required!'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email',
      },
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    location: {
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
    phone: {
      type: String,
      minlength: 8,
      maxlength: 8,
    },
    image: {
      type: String,
    },
    domain: {
      type: String,
    },
    role: {
      type: String,
      enum: ['jobSeeker', 'recruiter'],
      default: 'jobSeeker',
    },
    coins: {
      type: Number,
      required: false,
    },
    otp: {
      type: String,
      required: false,
    },
    tokens:[{
      type: Object
    }]
  },
  {
    timestamps: true,
  }
);

// Discriminator for Job Seeker
const jobSeekerSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['junior', 'confirmed', 'senior'],
    },
    skills: {
      type: [String],
    },
    resume_file: {
      type: String,
    },
  },
  { discriminatorKey: 'role' }
);

// Discriminator for Recruiter
const recruiterSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['company', 'individual', 'recruitment_agency', 'headhunter'],
    },
    images: {
      type: [String],
    },
    bio:{
      type: String,
    },
    companyName:{
      type: String,
    },
  },
  { discriminatorKey: 'role' }
);

// Define the User model using the base schema
const User = model('User', userSchema);

// Define the JobSeeker model using the Job Seeker schema as a discriminator
const JobSeeker = User.discriminator('JobSeeker', jobSeekerSchema);

// Define the Recruiter model using the Recruiter schema as a discriminator
const Recruiter = User.discriminator('Recruiter', recruiterSchema);

export { User, JobSeeker, Recruiter };