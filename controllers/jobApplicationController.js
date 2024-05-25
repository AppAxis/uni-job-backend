import JobApplication from '../models/job-application.js';
import JobOffer from '../models/job-offer.js';
import { User,JobSeeker,Recruiter} from '../models/user.js';
import {rejectApplication}from '../controllers/utils/mailer.js';

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
export async function acceptJobApplication(req, res) {
  try {
    const { applicationId } = req.params;

    // Find the job application
    const jobApplication = await JobApplication.findById(applicationId);
    if (!jobApplication) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Update the status of the job application to accepted
    jobApplication.status = 'accepted';
    await jobApplication.save();



    res.status(200).json({ message: 'Job offer accepted successfully', jobApplication });
  } catch (error) {
    console.error('Error accepting job offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function declineJobApplication(req, res) {
  try {
    const { applicationId } = req.params;

    // Trouver la candidature
    const jobApplication = await JobApplication.findById(applicationId).populate('jobSeeker');
    if (!jobApplication) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Trouver l'offre d'emploi
    const jobOffer = await JobOffer.findById(jobApplication.jobId);
    if (!jobOffer) {
      return res.status(404).json({ error: 'Job offer not found' });
    }

    // Mettre à jour le statut de la candidature à "rejeté"
    jobApplication.status = 'rejected';
    await jobApplication.save();

    // Supprimer l'ID de l'application de la liste appliedBy dans l'offre d'emploi
    jobOffer.appliedBy.pull(applicationId);
    await jobOffer.save();

    // Envoyer un email de notification au candidat
    if (jobApplication.jobSeeker) {
      await rejectApplication(jobApplication.jobSeeker, jobOffer);
    }

    res.status(200).json({ message: 'Job offer declined successfully', jobApplication });
  } catch (error) {
    console.error('Error declining job offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getApplicationsForJob(req, res) {
  try {
      const jobId = req.params.jobId;
      console.log(jobId); 
      const jobApplications = await JobApplication.find({ jobId })
      .populate('jobSeeker')
      .populate({
        path: 'jobId',
        populate: {
          path: 'postedBy'
        }
      })
      .exec();
      if (jobApplications.length === 0) {
          return res.status(404).json({ error: 'No job applications found for this job offer' });
      }
      res.status(200).json(jobApplications );
      console.log(jobApplications);
  } catch (error) {
      console.error('Error fetching job applications for job offer:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getApplicationsByJobSeeker(req, res) {
  try {
    JobApplication.find({jobSeeker: req.user._id})
    .populate({
      path: 'jobId',
      populate: {
          path: 'postedBy',
      }
    }).then((jobApplications) => {
      res.status(200).json(jobApplications);
      console.log(jobApplications);
      console.log(req.user._id);
    })
  } catch (error) {
    console.error('Error fetching job applications for job seeker:', error);
    res.status(400).json({ success:false, message: error.message });
  }
}
