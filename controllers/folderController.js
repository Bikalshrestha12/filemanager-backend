const Folder = require('../models/Folder');
const File = require('../models/File');

exports.createFolder = async (req, res) => {
  try {
    const { name, parent } = req.body;

    const folder = new Folder({
      name,
      parent: parent || null,
      owner: req.user.id,
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const parentParam = req.query.parent;
    const parent = parentParam === 'root' ? null : parentParam;

    const folders = await Folder.find({ 
      owner: req.user.id, 
      parent: parent 
    }).sort({ createdAt: -1 });

    res.json(folders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ 
      _id: req.params.id, 
      owner: req.user.id 
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    res.json(folder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateFolder = async (req, res) => {
  try {
    const { name } = req.body;
    const folder = await Folder.findOne({ 
      _id: req.params.id, 
      owner: req.user.id 
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    folder.name = name;
    await folder.save();

    res.json(folder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ 
      _id: req.params.id, 
      owner: req.user.id 
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Check if folder has subfolders
    const subfolders = await Folder.find({ parent: req.params.id });
    if (subfolders.length > 0) {
      return res.status(400).json({ error: 'Cannot delete folder with subfolders' });
    }

    // Check if folder has files
    const files = await File.find({ folder: req.params.id });
    if (files.length > 0) {
      return res.status(400).json({ error: 'Cannot delete folder with files' });
    }

    await Folder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};