const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/images'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '--' + file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  const acceptableExtensions = ['.png', '.jpg', '.mp4'];
  if (!acceptableExtensions.includes(path.extname(file.originalname))) {
    return callback(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }

  const fileSize = parseInt(req.headers['content-length']);
  if (fileSize > 1048576) {
    return callback(new Error('File Size Big'));
  }

  callback(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  fileSize: 1048576, // 10 Mb
});

module.exports = upload.single('profileImg');