import { User,JobSeeker,Recruiter} from '../models/user.js';
import Likes from '../models/recruiter-like.js';

export async function LikeJobSeeker(req, res) {
    try {
      const { recruiter_id, jobSeeker_id } = req.body;
      console.log("====================================");
      console.log(recruiter_id, jobSeeker_id);
      console.log("====================================");
      const recruiter = await User.findById(recruiter_id);
      console.log(recruiter);
      const jobSeeker = await User.findById(jobSeeker_id);
      console.log(jobSeeker);
      if (!recruiter) {
        return res.status(404).json({ error: "Recruiter not found" });
      }
      if (!jobSeeker) {
        return res.status(404).json({ error: "Job seeker not found" });
      }
      const like = new Likes({
        recruiter_id,
        jobSeeker_id,
        isLike: req.body.isLike,
        isSuper:req.body.isSuper,
        message: req.body.message || "",
        status: req.body.status || "pending",
      });
      const savedLike = await like.save();
      return res
        .status(200)
        .json({ message: "Like added successfully", like: savedLike });
    } catch (error) {
      console.error("Error liking job seeker:", error);
      return res.status(500).json({ error: "Failed to like job seeker" });
    }
  }
  export async function getAllLikesForJobSeeker(req, res) {
    try {
      // Extract job seeker ID from the request parameters
      const jobSeekerId = req.params.jobSeekerId;
  
      // Query the Likes model to find all likes where jobSeeker_id matches jobSeekerId
      const likes = await Likes.find({
        jobSeeker_id: jobSeekerId,
        isLike: true,
      
      }).populate('recruiter_id').populate('jobSeeker_id')// Assuming you want to populate recruiter details
  
      // Populate the recruiter details for each like
  
      // Respond with the list of recruiters who liked the job seeker's profile
      res.status(200).json(likes);
    } catch (error) {
      // Log the error and respond with an error message
      console.error("Error fetching likes for job seeker:", error);
      res.status(500).json({ error: "Failed to fetch likes for job seeker" });
    }
  }
  // Function for a job seeker to accept a like
  export async function acceptLike(req, res) {
    try {
      const likeId = req.params.likeId;
      const jobSeekerId = req.body.id; // Assuming you have the authenticated job seeker's ID in req.user.id
  
      // Retrieve the like from the database
      const like = await Likes.findById(likeId);
  
      // Check if jobSeekerId matches like.jobSeeker_id
      if (like ) {
        // Update the status of the like to 'accepted' and set the acceptedBy field
        const updatedLike = await Likes.findByIdAndUpdate(
          likeId,
          { status: "accepted" },
          { new: true }
        );
  
        res
          .status(200)
          .json({ message: "Like accepted successfully", like: updatedLike });
      } else {
        res.status(403).json({ error: "Unauthorized to accept this like" });
      }
    } catch (error) {
      console.error("Error accepting like:", error);
      res.status(500).json({ error: "Failed to accept like" });
    }
  }
  
  // Function for a job seeker to decline a like
  export async function declineLike(req, res) {
    try {
      const likeId = req.params.likeId;
      const jobSeekerId = req.body.id; // Assuming you have the authenticated job seeker's ID in req.user.id
      console.log('====================================');
      console.log(likeId," ",jobSeekerId);
      console.log('====================================');
      // Retrieve the like from the database
      const like = await Likes.findById(likeId);
  
      // Check if jobSeekerId matches like.jobSeeker_id
      if (like ) {
        // Update the status of the like to 'rejected' and set the rejectedBy field
        const updatedLike = await Likes.findByIdAndUpdate(
          likeId,
          { status: "rejected" },
          { new: true }
        );
  
        res
          .status(200)
          .json({ message: "Like declined successfully", like: updatedLike });
      } else {
        res.status(403).json({ error: "Unauthorized to decline this like" });
      }
    } catch (error) {
      console.error("Error declining like:", error);
      res.status(500).json({ error: "Failed to decline like" });
    }
  }
  