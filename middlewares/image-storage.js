import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import path from 'path';


// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Combined image storage
const storageCombined = multer.diskStorage({
  destination: function (req, file, cb) {
    const role = req.body.role || req.user.role;
    cb(null, path.join(__dirname, `../uploads/images`));
  },
  filename: function (req, file, cb) {
    const role = req.body.role || req.user.role;
    cb(null, `${role}_${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, callback) => {
  const acceptableExtensions = ['.png', '.jpg', '.jpeg', '.mp4'];
  if (!acceptableExtensions.includes(path.extname(file.originalname))) {
    return callback(new Error('Only .png, .jpg, and .jpeg formats are allowed!'));
  }

  const fileSize = parseInt(req.headers['content-length']);
  if (fileSize > 10485760) {
    return callback(new Error('File Size Big'));
  }

  callback(null, true);
};

const uploadCombinedImages = multer({
  storage: storageCombined,
  fileFilter: fileFilter,
  fileSize: 10485760,
}).fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 6 }]);

export { uploadCombinedImages };

/*// Single image storage
const storageSingleImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, `../uploads/images/single`));
  },
  filename: function (req, file, cb) {
    const role = req.body.role || req.user.role; 
    cb(null, `${role}_${Date.now()}_${file.originalname}`);
  },
});

// Multiple images storage
const storageMultiImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, `../uploads/images/multi`));
  },
  filename: function (req, file, cb) {
    const role = req.body.role ||  req.user.role; 
    cb(null, `${role}_${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, callback) => {
  const acceptableExtensions = ['.png', '.jpg', '.mp4'];
  if (!acceptableExtensions.includes(path.extname(file.originalname))) {
    return callback(new Error('Only .png, .jpg, and .jpeg formats are allowed!'));
  }

  const fileSize = parseInt(req.headers['content-length']);
  if (fileSize > 1048576) {
    return callback(new Error('File Size Big'));
  }

  callback(null, true);
};

const uploadMultiImage = multer({
  storage: storageMultiImage,
  fileFilter: fileFilter,
  fileSize: 1048576, // 10 Mb
}).array('images', 5);

const uploadSingleImage = multer({
  storage: storageSingleImage,
  fileFilter: fileFilter,
  fileSize: 1048576, // 10 Mb
}).single('image');
*/