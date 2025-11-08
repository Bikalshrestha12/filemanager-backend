const express = require('express');
const {
  createFolder,
  getFolders,
  getFolder,
  updateFolder,
  deleteFolder
} = require('../controllers/folderController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', createFolder);
router.get('/', getFolders);
router.get('/:id', getFolder);
router.put('/:id', updateFolder);
router.delete('/:id', deleteFolder);

module.exports = router;