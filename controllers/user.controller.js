import bcrypt from 'bcryptjs';
import { User,JobSeeker,Recruiter} from '../models/user.js';
import generateToken from './utils/generateToken.js';
import otpGenerator from 'otp-generator';
import { resetMail } from "./utils/mailer.js";
import fs from "fs"


/** verify user */
export async function verifyUser(req, res, next) {
  try {
    const { email } = req.method === "GET" ? req.query : req.body;

    // Check the user existence
    const exist = await User.findOne({ email });

    if (!exist) {
      return res.status(404).send({ error: "Can't find User!" });
    }

    next();
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error" });
  }
}

// @desc    Register new user
// @route   POST /api/users/signup
// @access  Public
export async function signup(req, res) {
  const {
    firstName,
    lastName,
    email,
    password,
    role,
    location,
    phone,
    domain,
    type,
    skills,
    companyName,
    bio,
  } = req.body;

  let image;
  if (req.files && req.files['image'] && req.files['image'].length > 0) {
    image = `/uploads/images/${req.files['image'][0].filename}`;
  } else {
    image = "/uploads/images/user.png"; 
  }

  let uploadedImages = [];
  if (req.files && req.files['images'] && req.files['images'].length > 0) {
    uploadedImages = req.files['images'].map(file => `/uploads/images/${file.filename}`);
  } else {
    uploadedImages = ['/uploads/images/company.png'];
  }

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please add all fields.' });
    }

    if (!['jobSeeker', 'recruiter'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Génération de l'OTP
    const otp = otpGenerator.generate(4, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    
    // Create a user instance with the necessary fields
    let newUser;
    if (role === 'jobSeeker') {
      newUser = new JobSeeker({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        location,
        phone,
        domain,
        role,
        image: image,
        type,
        skills,
        otp,
      });
    } else if (role === 'recruiter') {
      let recruiterCompanyName;
      if (type === 'company'|| type === 'recruitment_agency') {
        recruiterCompanyName = companyName;
      } else if (type === 'individual' || type === 'headhunter') {
        recruiterCompanyName = `${firstName} ${lastName}`;
      }
      newUser = new Recruiter({
        email,
        password: hashedPassword,
        location,
        phone,
        domain,
        role,
        image:image,
        type,
        companyName: recruiterCompanyName || `${firstName} ${lastName}`,
        bio,
        images: uploadedImages,
        otp,
      });
    }

    const savedUser = await newUser.save();
    const token = generateToken(savedUser._id, savedUser.role);
    const userId = savedUser._id;

    res.status(200).json({
      message: 'User registered successfully.',
      userId,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

  // @desc    Authenticate user
  // @route   POST /api/users/signin
  // @access  Public

  export async function signin (req,res) {
    const {email,password} =  req.body;
    const user = await User.findOne({"email": email});
    if(!user){
        return res.status(403).json({error: "user not found"});
    }
    const passwordCompare = await bcrypt.compare(password,user.password);
    if(!passwordCompare){
        return res.status(403).json({error : "password failed"})
    }
    const token = generateToken(user._id, user.role);
    let oldTokens = user.tokens || [];
    if(oldTokens.length){
 oldTokens = oldTokens.filter(t =>{
const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000
if(timeDiff < 86400){
  return t;
}
})
    }
    await User.findByIdAndUpdate(user._id,{tokens:[...oldTokens,{token,signedAt:Date.now().toString()}]})
    res.status(200).json({success: true , token: token,role: user.role});
}
// @desc    Get user data
// @route   Get /api/users/me
// @access  Private
export async function getMe(req, res) {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// @desc    Get user data by ID
// @route   GET /api/users/:userId
// @access  Private
export async function getUserById(req, res) {
  try {
    // Query the User model to find a user by its ID
    const user = await User.findById(req.params.id).exec();

    // If the query is successful, send the user data as a response with a 200 status code
    if (user) {
      res.status(200).json(user);
    } else {
      // If the user is not found, send a 404 status code with an error message
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    // If there's an error, send an error message with an appropriate status code
    res.status(500).json({ message: 'Error retrieving user', error });
  }
}
  // @desc    Update user data
// @route   PUT /api/users/editprofile
// @access  Private

export async function editProfile(req, res) {
  try {
    const { firstName, lastName, email, location, phone, domain, type, skills, password, companyName,bio} = req.body;
    console.log(req.body);
    const user = await User.findById(req.user._id);
    console.log(user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.location = location;
    user.phone = phone;
    user.domain = domain;
    user.type = type;
    user.skills = skills;
    user.companyName = companyName;
    user.bio = bio;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      user.password = hash;
    }
    await user.save();
    const token = generateToken(user._id, user.role);
    return res.status(200).json({ message: "Profile updated successfully", data: user,token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ Error: "Server error" });
  }
}

// @desc    Update user profile image
// @route   PUT /api/users/editProfileImage
// @access  Private
export async function editProfileImage(req, res) {
  try {
    const user = await User.findById(req.user._id);
   const oldImageFileName = user.image.split('/').pop();
   await deleteFile(oldImageFileName, './uploads/images');

   // Update the user's image path
   const newImageFileName = req.files && req.files['image'] && req.files['image'].length > 0
     ? req.files['image'][0].filename
     : oldImageFileName;

   user.image = `/uploads/images/${newImageFileName}`;
   await user.save();
    res.status(200).json({ message: "Profile image changed" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ Error: "Server error" });
  }
}
// @desc    Update recruiter images
// @route   PUT /api/users/editRecruiterImages
// @access  Private
/*export async function editRecruiterImages(req, res) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Delete old images
   user.images.forEach(async (images) => {
      const oldImageFileName = images.split('/').pop();
      await deleteFile(oldImageFileName, './uploads/images');
    });

    // Update images array with new image filenames
    const newImageFileNames = req.files && req.files['images']
      ? req.files['images'].map(file => `/uploads/images/${file.filename}`)
      : user.images;

    user.images = newImageFileNames;

    // Save the updated recruiter document
    await user.save();

    res.status(200).json({ message: 'Recruiter images updated successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ Error: 'Server error' });
  }
}*/

//@desc    Upload jobSeeker resume_file
//@route   POST /api/users/uploadResumeFile
//@access  Private
    export async function uploadResumeFile(req, res) {
      try {
          const user = await User.findById(req.user._id);
  
          if (!user) {
              return res.status(404).json({ error: 'User not found' });
          }
  
          if (user.role !== 'jobSeeker') {
              return res.status(403).json({ error: "not authorized" });
          }
  
          const file = await req.file.filename;
          user.resume_file = `/uploads/files/${file}`;
          await user.save();
  
          res.status(200).json({ message: "resume file added" });
  
      } catch (e) {
          console.error(e);
          res.status(500).json({ error: 'server error' });
      }
  }

// @desc    Update jobSeeker resume_file
// @route   PUT /api/users/editProfileResume
// @access  Private
export async function editResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume uploaded.' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.role !== 'jobSeeker') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    // Delete the old resume file
    deleteFile(user.resume_file, "./uploads/files");

    const { originalname, filename } = req.file;

    // Build the full path of the new resume file
    const newResumeFilePath = `/uploads/files/${filename}`;

    // Update the resume_file field in the user document
    user.resume_file = newResumeFilePath;

    // Save the updated user document
    await user.save();

    return res.status(200).json({
      message: 'Resume updated successfully',
      resume_file: newResumeFilePath,
      originalName: originalname,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
// @desc    forget password
// @route   POST /api/users/forgetPassword
// @access  Public
    export async function forgetPassword(req, res) {
      const { email } = req.body;
  
      // Rechercher l'utilisateur par son adresse e-mail
      User.findOne({ "email": email })
          .then(user => {
              if (user == null) {
                  res.status(404).json({ error: "Non trouvé" });
                  return;
              }
              // Générer un OTP (One-Time Password) pour la réinitialisation du mot de passe
              user.otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, digits: true, lowerCaseAlphabets: false });
              // Envoyer un e-mail contenant l'OTP pour la réinitialisation du mot de passe
              resetMail(user);
              user.save();
              res.status(200).json({ _id: user._id });
          })
          .catch(e => {
              res.status(500).json({ error: "Erreur serveur" });
          });
  }
 // @desc  reset password
  // @route POST /api/users/resetPassword
  // @access Private
  export async function resetPassword(req,res){
    try{const {id,otp}=req.body
    const user= await User.findById(id)
    if(otp===user.otp){
      const token = generateToken(user._id, user.role);
        res.status(200).json({success: true , data: token});
    }
    else{
        res.status(403).json({error:"Wrong code"})
    }
}    
    catch(e){
      res.status(500).json({ error: e.message || 'Internal Server Error' });
    }
}
// @desc    Update user password after OTP verification
// @route   PUT /api/users/updatePassword
// @access  Private
export async function updatePassword(req, res) {
  try {
    const {newPassword, confirmPassword } = req.body;

    const user = await User.findOne(req.user._id)

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Update the user's password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}
// @desc    Get all job seekers
// @route   GET /api/users/jobSeekers
// @access  Private 
export async function getAllJobSeekers(req, res) {
  try {
    // Find all job seekers using the JobSeeker model
    const jobSeekers = await JobSeeker.find();

    // Check if any job seekers were found
    if (!jobSeekers || jobSeekers.length === 0) {
      return res.status(404).json({ message: "No job seekers found" });
    }

    // If job seekers are found, return them
    res.status(200).json(jobSeekers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
      // @desc    Change user password
    // @route   PUT /api/users/changePassword
    // @access  Private

export async function changePassword(req, res) {
    try {
      const {password,newpassword} =  req.body;
      const user = await User.findOne(req.user._id)
      const passwordCompare = await bcrypt.compare(password,user.password);
      if(!passwordCompare){
          return res.status(403).json({error : "password failed"})
      }
  
      const hash = await bcrypt.hash(newpassword,10);
      user.password = hash;
      await user.save();

        res.status(200).json({ success: true, msg: 'Password changed successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
      }
    }  
   
export async function loadAuth(req, res) {
    res.render('auth')
}

export async function successGoogleLogin(req, res) {
    if(!req.user)
    res.redirect('/failure');
console.log(req.user);
res.send("welcome"+req.user.email);
}
export async function failureGoogleLogin(req, res) {
    res.send("Error");
}

function deleteFile(fileName,path) {
  try {
  if (fs.existsSync(`${path}/${fileName}`)) {
    fs.unlinkSync(`${path}/${fileName}`);
    console.log(`File '${fileName}' deleted successfully.`);
  } else {
    console.log(`File '${fileName}' not found.`);
  }
  } catch (error) {
      throw error;
  }
  
}
// @desc    Logout user
// @route   GET /api/users/signOut
// @access  Private
export async function signOut(req, res) {
  try {
    // Check if authorization header exists
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ success: false, message: 'Authorization fail!' });
      }

      // Remove the logged-out token
      const tokens = req.user.tokens;
      const newTokens = tokens.filter((t) => t.token !== token);

      // Update user's tokens in the database
      await User.findByIdAndUpdate(req.user._id, { tokens: newTokens });

      return res.json({ success: true, message: 'Logged out' });
    } else {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}




