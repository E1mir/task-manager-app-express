const express = require('express')
const fs = require('fs')

const userController = require('../controllers/userController')
const fileController = require('../controllers/fileController')
const {
  getBytes,
  createFileFilter
} = require("../utils");

const multer = require('multer')
const auth = require('../middleware/auth')
const path = require('path');
const {sendSs} = require("../emails/account");


const router = express.Router()

const destinationFolder = 'uploads/images/avatars';

if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images/avatars');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const fileName = `avatar_${req.user._id}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: getBytes(1, 'MB')
  },
  fileFilter: createFileFilter(['jpg', 'jpeg', 'png'])
})

// POST
router.post('/users', userController.createUser)
router.post('/users/login', userController.loginUser)
router.post('/users/logout', auth, userController.logoutUser)
router.post('/users/logoutAll', auth, userController.logoutAllUser)
router.post(
  '/users/me/avatar',
  auth,
  upload.single('avatar'),
  userController.uploadProfileAvatar,
  fileController.handleFileError
)
router.post('/users/ss', async (req,res)=> {
  try {
    await sendSs()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})
// GET
router.get('/users', auth, userController.getUsers)
router.get('/users/me', auth, userController.getProfileUser)
router.get('/users/:id', userController.getUserById)

// PATCH
router.patch('/users/me', auth, userController.updateProfileUser)

// DELETE
router.delete('/users/me', auth, userController.deleteProfileUser)
router.delete('/users/me/avatar', auth, userController.deleteProfileAvatar)
module.exports = router
