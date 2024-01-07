const multer = require("multer");

const handleFileError = (err, req, res, next) => {
  if (err) {
    if (err instanceof multer.MulterError || err.message.startsWith('Invalid file type')) {
      return res.status(400).send({error: err.message});
    } else {
      console.error(err)
      res.status(500).send()
    }
  } else {
    next()
  }
}

const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).send({error: 'No file provided.'});
  }
  res.send({message: 'Document uploaded.'})
}


module.exports = {
  handleFileError,
  uploadFile
}
