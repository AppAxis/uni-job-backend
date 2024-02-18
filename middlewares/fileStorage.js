const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
  destination: function (_request, _file, callback) {
    callback(null, path.join(__dirname, "../uploads/files"));
  },
  filename: function (_request, file, callback) {
    callback(null, "FILE_" + Date.now() + path.extname(file.originalname))
  }
});

module.exports = multer({storage});