import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const getCloudinaryPath = (type, file, req) => {
  const { course, semester, subject } = req.body;
  const year = req.body.year || new Date().getFullYear();
  
  switch(type) {
    case 'PYQ':
      return `uniconnect/${course}/${semester}/${subject}/${year}/pyqs`;
    case 'ASSIGNMENT':
      return `uniconnect/${course}/${semester}/${subject}/assignments`;
    case 'NOTE':
      return `uniconnect/${course}/${semester}/${subject}/notes`;
    default:
      return 'uniconnect/others';
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: (req, file) => getCloudinaryPath(req.body.uploadType, file, req),
    allowed_formats: ['pdf'],
    resource_type: 'raw'
  }
});


export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  }
});

export const deleteFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};