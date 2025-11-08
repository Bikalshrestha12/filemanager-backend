// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Ensure uploads directory exists
// const uploadsDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const folderId = req.body.folder || 'root';
//     const folderPath = path.join(uploadsDir, folderId);
    
//     if (!fs.existsSync(folderPath)) {
//       fs.mkdirSync(folderPath, { recursive: true });
//     }
    
//     cb(null, folderPath);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', 
//     '.pdf', '.txt', '.jpg', '.jpeg', '.png', '.gif'
//   ];
//   const fileExt = path.extname(file.originalname).toLowerCase();
  
//   if (allowedTypes.includes(fileExt)) {
//     cb(null, true);
//   } else {
//     cb(new Error('File type not allowed'), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 50 * 1024 * 1024 // 50MB limit
//   }
// });

// module.exports = upload;


const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory: ${dirPath}`, error);
  }
}

// Storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Determine folder path (using 'root' if not provided)
      const folderId = req.body.folder || 'root';
      const folderPath = path.join(uploadsDir, folderId);

      // Ensure the directory exists
      await ensureDirectoryExists(folderPath);
      cb(null, folderPath);
    } catch (error) {
      console.error('Error in file destination:', error);
      cb(new Error('Failed to create the destination folder'), false);
    }
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Documents
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf',
    // Text files
    '.txt', '.md', '.rtf',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
    // Archives and others
    '.zip', '.rar', '.7z'
  ];

  const fileExt = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(fileExt)) {
    cb(null, true); // File is allowed
  } else {
    console.log(`Rejected file: ${file.originalname} with type ${fileExt}`);
    cb(new Error(`File type ${fileExt} not allowed`), false); // Reject file
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // Max 100MB file size
  }
});

module.exports = upload;
