// const File = require('../models/File');
// const Folder = require('../models/Folder');
// const path = require('path');
// const fs = require('fs').promises;
// const XLSX = require('xlsx');
// const mammoth = require('mammoth');

// exports.uploadFile = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const fileType = getFileType(req.file.originalname);
    
//     const file = new File({
//       name: req.body.name || req.file.originalname,
//       filename: req.file.filename,
//       originalName: req.file.originalname,
//       path: req.file.path,
//       size: req.file.size,
//       type: fileType,
//       folder: req.body.folder || null,
//       owner: req.user.id,
//     });

//     // Extract content for text-based files
//     if (fileType === 'word') {
//       try {
//         const result = await mammoth.extractRawText({ path: req.file.path });
//         file.content = result.value;
//       } catch (error) {
//         console.error('Error extracting Word content:', error);
//       }
//     } else if (fileType === 'excel') {
//       try {
//         const workbook = XLSX.readFile(req.file.path);
//         const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
//         const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
//         file.content = JSON.stringify(data);
//       } catch (error) {
//         console.error('Error extracting Excel content:', error);
//       }
//     }

//     await file.save();
//     await file.populate('folder', 'name');

//     res.status(201).json(file);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// exports.getFiles = async (req, res) => {
//   try {
//     let folder = req.query.folder;

//     if (folder === 'root') {
//       folder = null; 
//     }

//     const files = await File.find({
//       owner: req.user.id,
//       folder: folder,
//     })
//       .populate('folder', 'name')
//       .sort({ uploadDate: -1 });

//     res.json(files);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// exports.getFile = async (req, res) => {
//   try {
//     const file = await File.findOne({ 
//       _id: req.params.id, 
//       owner: req.user.id 
//     }).populate('folder', 'name');

//     if (!file) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     res.json(file);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// exports.updateFile = async (req, res) => {
//   try {
//     const { name, content } = req.body;
//     const file = await File.findOne({ 
//       _id: req.params.id, 
//       owner: req.user.id 
//     });

//     if (!file) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     if (name) file.name = name;
//     if (content) file.content = content;

//     // If it's an Excel file and content changed, update the actual file
//     if (content && file.type === 'excel') {
//       try {
//         const data = JSON.parse(content);
//         const ws = XLSX.utils.aoa_to_sheet(data);
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
//         XLSX.writeFile(wb, file.path);
//       } catch (error) {
//         console.error('Error updating Excel file:', error);
//       }
//     }

//     // If it's a Word file and content changed, update the actual file
//     if (content && file.type === 'word') {
//       try {
//         await fs.writeFile(file.path, content);
//       } catch (error) {
//         console.error('Error updating Word file:', error);
//       }
//     }

//     await file.save();
//     res.json(file);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// exports.deleteFile = async (req, res) => {
//   try {
//     const file = await File.findOne({ 
//       _id: req.params.id, 
//       owner: req.user.id 
//     });

//     if (!file) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     // Delete physical file
//     try {
//       await fs.unlink(file.path);
//     } catch (error) {
//       console.error('Error deleting physical file:', error);
//     }

//     await File.findByIdAndDelete(req.params.id);
//     res.json({ message: 'File deleted successfully' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// exports.downloadFile = async (req, res) => {
//   try {
//     const file = await File.findOne({ 
//       _id: req.params.id, 
//       owner: req.user.id 
//     });

//     if (!file) {
//       return res.status(404).json({ error: 'File not found' });
//     }

//     res.download(file.path, file.originalName);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Helper function to determine file type
// function getFileType(filename) {
//   const ext = path.extname(filename).toLowerCase();
  
//   if (['.doc', '.docx'].includes(ext)) return 'word';
//   if (['.xls', '.xlsx'].includes(ext)) return 'excel';
//   if (['.ppt', '.pptx'].includes(ext)) return 'powerpoint';
//   if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) return 'image';
//   if (['.pdf'].includes(ext)) return 'pdf';
//   if (['.txt'].includes(ext)) return 'text';
  
//   return 'other';
// }


const File = require('../models/File');
const Folder = require('../models/Folder');
const path = require('path');
const fs = require('fs').promises;
const XLSX = require('xlsx');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
const PptxGenJS = require('pptxgenjs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// File upload handler
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileType = getFileType(req.file.originalname);
    
    const file = new File({
      name: req.body.name || req.file.originalname,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      type: fileType,
      folder: req.body.folder || null,
      owner: req.user.id,
    });

    // Extract content based on file type
    try {
      switch (fileType) {
        case 'word':
          const wordResult = await mammoth.extractRawText({ path: req.file.path });
          file.content = wordResult.value;
          break;
        
        case 'excel':
          const workbook = XLSX.readFile(req.file.path);
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          file.content = JSON.stringify({
            data: excelData,
            sheetName: workbook.SheetNames[0]
          });
          break;

        case 'powerpoint':
          if (req.body.powerpointData) {
            const pptData = JSON.parse(req.body.powerpointData);
            const pptx = new PptxGenJS();
            pptData.slides.forEach((slideContent) => {
              const slide = pptx.addSlide();
              slide.addText(slideContent, {
                x: 0.5,
                y: 0.5,
                w: 9,
                h: 6,
                fontSize: 18,
                align: 'left'
              });
            });

            const buffer = await pptx.write("nodebuffer");
            await fs.writeFile(file.path, buffer);
            file.content = req.body.powerpointData;
          }
          break;
        
        case 'pdf':
          const dataBuffer = await fs.readFile(req.file.path);
          const pdfData = await pdf(dataBuffer);
          file.content = pdfData.text;
          break;

        case 'text':
          file.content = await fs.readFile(req.file.path, 'utf8');
          break;
        
        case 'image':
          file.content = JSON.stringify({
            type: 'image',
            edited: false
          });
          break;

        default:
          file.content = 'File content not extractable';
      }
    } catch (extractError) {
      console.error('Error extracting file content:', extractError);
      file.content = `Unable to extract content: ${extractError.message}`;
    }

    await file.save();
    await file.populate('folder', 'name');

    res.status(201).json(file);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error during file upload' });
  }
};

// Get all files
exports.getFiles = async (req, res) => {
  try {
    let folder = req.query.folder;

    if (folder === 'root') {
      folder = null;
    }

    const files = await File.find({ owner: req.user.id, folder })
      .populate('folder', 'name')
      .sort({ uploadDate: -1 });

    res.json(files);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a specific file
exports.getFile = async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id, 
      owner: req.user.id 
    }).populate('folder', 'name');

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update file details or content
exports.updateFile = async (req, res) => {
  try {
    const { name, content, excelData, powerpointData, imageData, pdf } = req.body;
    const file = await File.findOne({ 
      _id: req.params.id, 
      owner: req.user.id 
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (name) file.name = name;

    // Handle different file types
    switch (file.type) {
      case 'word':
        if (content) {
          file.content = content;
          await fs.writeFile(file.path, content);
        }
        break;

      case 'excel':
        if (excelData) {
          const data = JSON.parse(excelData);
          const ws = XLSX.utils.aoa_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          XLSX.writeFile(wb, file.path);
          file.content = JSON.stringify({
            data: data,
            sheetName: 'Sheet1'
          });
        }
        break;

      case 'powerpoint':
        if (powerpointData) {
          const pptData = JSON.parse(powerpointData);
          const pptx = new PptxGenJS();
          
          pptData.slides.forEach((slideContent) => {
            const slide = pptx.addSlide();
            slide.addText(slideContent, {
              x: 0.5,
              y: 0.5,
              w: 9,
              h: 6,
              fontSize: 18,
              align: 'left'
            });
          });

          await pptx.writeFile(file.path);
          file.content = powerpointData;
        }
        break;
      
      case 'pdf':
        if (content) {
          const pdfDoc = await PDFDocument.create();
          let page = pdfDoc.addPage();
          const { width, height } = page.getSize();
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const fontSize = 12;

          const lines = content.split('\n');
          let y = height - 50;
          lines.forEach((line) => {
            if (y < 50) {
              page = pdfDoc.addPage();
              y = height - 50;
            }
            page.drawText(line, {
              x: 50,
              y,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });
            y -= 20;
          });

          const pdfBytes = await pdfDoc.save();
          await fs.writeFile(file.path, pdfBytes);
          file.content = content;
        }
        break;

      case 'text':
        if (content) {
          file.content = content;
          await fs.writeFile(file.path, content);
        }
        break;

      case 'image':
        if (imageData) {
          const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
          const imageBuffer = Buffer.from(base64Data, 'base64');
          await fs.writeFile(file.path, imageBuffer);
          file.content = JSON.stringify({
            type: 'image',
            edited: true,
            lastEdited: new Date()
          });
        }
        break;

      default:
        return res.status(400).json({ error: 'This file type cannot be edited' });
    }

    file.lastModified = new Date();
    await file.save();

    res.json(file);
  } catch (error) {
    console.error('Update file error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id, 
      owner: req.user.id 
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete physical file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }

    await File.findByIdAndDelete(req.params.id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Download a file
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({ 
      _id: req.params.id, 
      owner: req.user.id 
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = file.path;
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Helper function to determine file type
function getFileType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const fileTypes = {
    '.doc': 'word',
    '.docx': 'word',
    '.xls': 'excel',
    '.xlsx': 'excel',
    '.csv': 'excel',
    '.ppt': 'powerpoint',
    '.pptx': 'powerpoint',
    '.pdf': 'pdf',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.txt': 'text',
    '.md': 'text',
    '.rtf': 'text',
    '.bin': 'binary'
  };

  return fileTypes[ext] || 'file';
}
