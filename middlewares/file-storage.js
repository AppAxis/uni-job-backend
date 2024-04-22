import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const destinationPath = path.join(__dirname, '../uploads/files');
    callback(null, destinationPath);
  },
  filename: (req, file, callback) => {
    const role = req.body.role || req.user.role; 
    const fileExtension = path.extname(file.originalname);
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // Get current date in YYYYMMDD format
    const fileName = `${role}_${datePart}_${file.originalname}`;
    callback(null, fileName);
  },
});

export default multer({ storage });