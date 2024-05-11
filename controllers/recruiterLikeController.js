import { User,JobSeeker,Recruiter} from '../models/user.js';
import Likes from '../models/recruiter-like.js';

export async function LikeJobSeeker(req, res) {
    try {
        const { recruiter_id, jobSeeker_id } = req.body;
        const recruiter = await Recruiter.findById(recruiter_id);
        console.log(recruiter);
        const jobSeeker = await JobSeeker.findById(jobSeeker_id);
        console.log(jobSeeker);
        if (!recruiter) {
            return res.status(404).json({ error: 'Recruiter not found' });
        }
        if (!jobSeeker) {
            return res.status(404).json({ error: 'Job seeker not found' });
        }
        const like = new Likes({
            recruiter_id,
            jobSeeker_id,
            message: req.body.message || '',
            status: req.body.status || 'pending',
        });
        const savedLike = await like.save();
        return res.status(200).json({ message: 'Like added successfully', like: savedLike });

    } catch (error) {
        console.error('Error liking job seeker:', error);
        return res.status(500).json({ error: 'Failed to like job seeker' });
    }
}
export async function getAllLikesForJobSeeker(req, res) {
    try {
        // Extract job seeker ID from the request parameters
        const jobSeekerId = req.params.jobSeekerId;

        // Query the Likes model to find all likes where jobSeeker_id matches jobSeekerId
        const likes = await Likes.find({ jobSeeker_id: jobSeekerId })
            // Populate the recruiter details for each like
            .populate('recruiter_id'); 

        // Respond with the list of recruiters who liked the job seeker's profile
        res.status(200).json(likes);
    } catch (error) {
        // Log the error and respond with an error message
        console.error('Error fetching likes for job seeker:', error);
        res.status(500).json({ error: 'Failed to fetch likes for job seeker' });
    }
}