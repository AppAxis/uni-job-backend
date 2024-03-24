import { User,JobSeeker,Recruiter} from '../models/user.js';
import JobOffer from '../models/job-offer.js';
import JobApplication from '../models/job-application.js';

export function addJobOffer(req, res) {
    JobOffer.create({
        title: req.body.title,
        employment: req.body.employment,
        jobLocation: {
            lat: req.body.jobLocation.lat,
            long: req.body.jobLocation.long
        },
        salary: req.body.salary,
        postedOn: req.body.postedOn,
        beginning_date: req.body.beginning_date,
        closingDate: req.body.closingDate,
        maxApplications: req.body.maxApplications,
        requirements: req.body.requirements,
        description: req.body.description,
        type: req.body.type,
        job_responsibilities: req.body.job_responsibilities,
        postedBy: req.user._id,
    })
    .then(newJobOffer => {
        console.log(newJobOffer);
        res.status(200).json(newJobOffer);
    })
    .catch((err) => {
        res.status(500).json({error: err});
    });
}
export function getAllJobOffers(req, res) {
    JobOffer.find()
        .populate('postedBy')
        .populate('appliedBy')
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