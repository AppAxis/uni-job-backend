import JobApplication from '../models/job-application.js';
import JobOffer from '../models/job-offer.js';
import { User,JobSeeker,Recruiter} from '../models/user.js';


export async function applyForJob(req, res) {
    try {
      const { jobId, jobSeekerId, message,isSuper} = req.body;
  
      // Check if the job offer exists
      const jobOffer = await JobOffer.findById(jobId);
      if (!jobOffer) {
        return res.status(404).json({ error: 'Job offer not found' });
      }
  
      // Check if the job seeker exists
      const jobSeeker = await JobSeeker.findById(jobSeekerId);
      if (!jobSeeker) {
        return res.status(404).json({ error: 'Job seeker not found' });
      }
  
      // Create a new job application
      const newJobApplication = new JobApplication({
        jobId,
        jobSeeker: jobSeekerId,
        message,
        status: 'pending', 
        isSuper,
        dateOfApplication:Date.now(),
      });
  
      // Save the job application
      await newJobApplication.save();
  
      // Optionally, update the job offer to reflect the new application
      jobOffer.appliedBy.push(newJobApplication._id);
      await jobOffer.save();
  
      res.status(200).json({ message: 'Job application submitted successfully', jobApplication: newJobApplication});
    } catch (error) {
      console.error('Error applying for job:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  export async function getApplicationById(req, res) {
    try {
        const applicationId = req.params.id;
        const jobApplication = await JobApplication.findById(applicationId)
            .populate('jobSeeker');

        if (!jobApplication) {
            return res.status(404).json({ error: 'Job application not found' });
        }

      
        res.status(200).json(jobApplication);
    } catch (error) {
        console.error('Error fetching job application by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}