import { User,JobSeeker,Recruiter} from '../models/user.js';
import JobOffer from '../models/job-offer.js';
import JobApplication from '../models/job-application.js';
import { format } from "date-fns";

export function addJobOffer(req, res) {
    try {
         console.log('Request Body:', req.body);
        const closingDate = req.body.closingDate ? format(new Date(req.body.closingDate), "yyyy-MM-dd") : null; 
        const beginningDate = req.body.beginningDate ? format(new Date(req.body.beginningDate), "yyyy-MM-dd") : null;
        const postedOn = req.body.postedOn ? format(new Date(req.body.postedOn), "yyyy-MM-dd") : null; 
        console.log('Parsed Dates:', { closingDate, beginningDate, postedOn });
          // Récupérez les informations d'application d'emploi du corps de la requête
          let appliedBy = req.body.appliedBy; 
        
          // Si appliedBy est vide ou non défini, initialisez-le avec un tableau vide
          if (!appliedBy) {
              appliedBy = [];
          }
  
        JobOffer.create({
            title: req.body.title,
            jobLocation: {
                lat: req.body.jobLocation.lat,
                long: req.body.jobLocation.long,
                address: req.body.jobLocation.address,
            },
            salary: req.body.salary,
            postedOn: postedOn,
            beginningDate: beginningDate,
            closingDate: closingDate,
            maxApplications: req.body.maxApplications,
            requirements: req.body.requirements,
            description: req.body.description,
            jobDomain:req.body.jobDomain,
            jobType: req.body.jobType,
            job_responsibilities: req.body.job_responsibilities,
            postedBy: req.user._id,
            appliedBy: appliedBy,
        })
        .then(newJobOffer => {
            console.log(newJobOffer);
            res.status(200).json(newJobOffer);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.message || 'Internal server error' });
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message || 'Bad request' });
    }
}
export async function passJobOffer(req, res) {
    try {
      const { jobId } = req.params;
  
      // Find the job offer
      const jobOffer = await JobOffer.findById(jobId);
      if (!jobOffer) {
        return res.status(404).json({ error: 'Job offer not found' });
      }
  
      // Add the current user to the passBy array if they haven't already passed the job offer
      if (!jobOffer.passBy.includes(req.user._id)) {
        jobOffer.passBy.push(req.user._id);
        await jobOffer.save();
      }
  
      res.status(200).json({ message: 'Job offer passed successfully', jobOffer });
    } catch (error) {
      console.error('Error passing job offer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  
export async function getJobOfferWithApplications(req, res) {
    try {
        const jobOfferId = req.params.id;
        const jobOffer = await JobOffer.findById(jobOfferId)
            .populate({
                path: 'appliedBy',
                populate: {
                    path: 'jobSeeker', 
                    model: 'JobSeeker',
                }
            })
            .exec();
        if (!jobOffer) {
            return res.status(404).json({ error: 'Job offer not found' });
        }

        // Retourner les détails de l'offre d'emploi avec les détails des utilisateurs
        res.status(200).json(jobOffer);
    } catch (error) {
        console.error('Error fetching job offer with applications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
export function getAllJobOffers(req, res) {
    JobOffer.find()
        .populate('postedBy')
        .then((jobOffers) => {
            res.status(200).json({ jobOffers: jobOffers });
        })
        .catch((err) => {
            console.error('Error fetching job offers:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
}
export function getJobOfferById(req, res) {
    const jobOfferId = req.params.id;
    JobOffer.findById(jobOfferId)
        .populate('postedBy')
        .then((jobOffer) => {
            if (!jobOffer) {
                return res.status(404).json({ error: 'Job offer not found' });
            }
            res.status(200).json({ jobOffer: jobOffer });
        })
        .catch((err) => {
            console.error('Error fetching job offer by ID:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
}

export function searchJobOffer(req, res) {
    const search = req.body.search;
    JobOffer.find({ title: { $regex: search, $options: "i" } })
        .then((jobOffers) => {
            if (jobOffers.length === 0) {
                return res.status(404).json({ message: "Job offers not found" });
            }
            res.status(200).json({ jobOffers: jobOffers });
        })
        .catch((err) => {
            console.error('Error searching job offers:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
}
// Get all jobs offers for a specific recruiter
export const getAllJobOffersForRecruiter = async (req, res) => {
    try {
     JobOffer.find({ postedBy: req.user._id })
     .populate('postedBy')
   
     .then((jobOffers) => {
            res.status(200).json({ jobOffers: jobOffers });
            console.log(jobOffers);
            console.log(req.user._id);
        })
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  export function updateMyJobOffer(req, res) {
    const jobId = req.params.id;
    const updateData = req.body;
    
    JobOffer.findOneAndUpdate({ _id: jobId, postedBy: req.user._id }, updateData)
        .then((jobOffer) => {
            if (!jobOffer) {
                return res.status(404).json({ error: 'Job offer not found' });
            }
            res.status(200).json({ message: "Job offer is updated!" });
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
}

export function deleteJobOffer(req, res) {
    const jobId = req.params.id;

    JobOffer.findOneAndDelete({ _id: jobId, postedBy: req.user._id })
        .then((jobOffer) => {
            if (!jobOffer) {
                return res.status(404).json({ error: 'Offre d\'emploi introuvable ou vous n\'êtes pas autorisé à la supprimer' });
            }
            res.status(200).json({ message: 'Offre d\'emploi supprimée avec succès' });
        })
        .catch((err) => {
            console.error('Erreur lors de la suppression de l\'offre d\'emploi:', err);
            res.status(500).json({ error: 'Erreur interne du serveur' });
        });
}


export async function fetchUserByApplicationId(applicationId) {
    try {
        // Fetch the job application by application ID
        const jobApplication = await JobApplication.findById(applicationId)
            .populate('jobSeeker', 'image') // Populate the job seeker field with the image URL
            .exec();
        
        // Check if the job application was found
        if (!jobApplication) {
            console.log('Job application not found');
            return null;
        }

        // Extract the user data (job seeker) from the job application
        const user = jobApplication.jobSeeker;

        // Return the user data as a JSON object
        if (user) {
            return {
                _id: user._id,
                image: user.image,
                // Include any other user properties as needed
            };
        } else {
            console.log('User not found for the given application ID');
            return null;
        }
    } catch (error) {
        console.error(`Error fetching user by application ID: ${error}`);
        return null;
    }
}