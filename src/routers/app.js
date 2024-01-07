const express = require("express");
const multer = require("multer");
const {getBytes, createFileFilter} = require("../utils");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

const auth = require('../middleware/auth')

const fileController = require("../controllers/fileController");


const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uuid = uuidv4()
    const fileName = `${uuid}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: getBytes(5, 'mb')
  },
  fileFilter: createFileFilter(['pdf', 'doc', 'docx'])
})

router.post('/upload', auth, upload.single('upload'), fileController.uploadFile, fileController.handleFileError)

module.exports = router
