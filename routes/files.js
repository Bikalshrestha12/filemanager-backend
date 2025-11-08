const express = require('express');
const {
  uploadFile,
  getFiles,
  getFile,
  updateFile,
  deleteFile,
  downloadFile
} = require('../controllers/fileController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(auth);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/', getFiles);
router.get('/:id', getFile);
router.put('/:id', updateFile);
router.delete('/:id', deleteFile);
router.get('/:id/download', downloadFile);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const fileController = require('../controllers/fileController');
// const auth = require('../middleware/auth'); // if using auth middleware

// // Route: GET /api/files
// router.get('/', auth, fileController.getFiles);

// // Route: GET /api/files/:id
// router.get('/:id', auth, fileController.getFile);

// // Route: POST /api/files/upload
// router.post('/upload', auth, upload.single('file'), fileController.uploadFile);

// // Route: PUT /api/files/:id
// router.put('/:id', auth, fileController.updateFile);

// // Route: DELETE /api/files/:id
// router.delete('/:id', auth, fileController.deleteFile);

// // Route: GET /api/files/:id/download
// router.get('/:id/download', auth, fileController.downloadFile);

// module.exports = router;
