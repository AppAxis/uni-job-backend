import mongoose from "mongoose";
import validator from "validator";
const { Schema, model} = mongoose;
const userSchema =  new Schema(
    {
        username: {
            type: String,
            required: [true, 'The name is required!'],
            trim: true,
            minlength: 3,
            maxlength: 20,
            validate: {
              validator: (val) => /^[a-zA-Z0-9]+$/.test(val),
              message: 'Username must only contain letters and numbers',
            },
          },
          email: {
            type: String,
            required: [true, "Email field required!"],
            validate: {
              validator: validator.isEmail,
              message: "Please provide a valid email",
            },
            unique: true,
          },
        password :{
            type: String,
            required: true,
            minlength: 6,
        },
        location: {
            type: String,
          },
        phone:{
          type : String,
          minlength: 8,
          maxlength: 8,
        },
        profileImg: {
            type:String,
            required: false
        },
        domain: {
             type: String,
             },
      
        role :{
            type: String,
            enum :['JobSeeker','Recruiter'],
            default: 'JobSeeker'
        },
        coins:{
            type: Number,
            required: false,
        },

    },
    {
        timestamps: true
    }
);
// Discriminator for Job Seeker
const jobSeekerSchema = new Schema(
    {
      type: {
        type: String,
        enum: ['Junior', 'Confirmed', 'Senior'],
      },
      skills: {
        type: [String],
      },
      resume_file: {
        type: String,
      },
    },
    { discriminatorKey: 'roleInfo' } // discriminatorKey is used to determine the role-specific fields
  );
  
  // Discriminator for Recruiter
  const recruiterSchema = new Schema(
    {
      type: {
        type: String,
        enum: ['Company', 'Individual', 'Recruitment_agency', 'Headhunter'],
      },
      workspace_images: {
        type: String,
      },
    },
    { discriminatorKey: 'roleInfo' }
  );
  
  // Define the User model using the base schema
  const User = model('User', userSchema);
  
  // Define the JobSeeker model using the Job Seeker schema as a discriminator
  const JobSeeker = User.discriminator('JobSeeker', jobSeekerSchema);
  
  // Define the Recruiter model using the Recruiter schema as a discriminator
  const Recruiter = User.discriminator('Recruiter', recruiterSchema);
  
  export { User, JobSeeker, Recruiter };