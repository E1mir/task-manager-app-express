const fs = require('fs')
const User = require("../models/user");
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account')

const createUser = async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    const token = await user.generateAuthToken()

    await sendWelcomeEmail(user.email, user.name)

    res.status(201).send({user, token})
  } catch (e) {
    res.status(400).send(e)
  }
}

const loginUser = async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()

    res.send({user, token})
  } catch (e) {
    res.status(400).send()
  }
}

const logoutUser = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()

    res.send()
  } catch (e) {
    res.status(500).send()
  }
}

const logoutAllUser = async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
}

const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
    res.send(users)
  } catch (e) {
    res.status(500).send(e)
  }
}

const getProfileUser = async (req, res) => {
  res.send(req.user)
}

const getUserById = async (req, res) => {
  const _id = req.params.id

  try {
    const user = await User.findById(_id)
    if (!user) {
      return res.status(404).send()
    }
    res.send(user)
  } catch (e) {
    res.status(500).send(e)
  }
}

const updateProfileUser = async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const isValid = updates.every((update) => allowedUpdates.includes(update))

  if (!isValid) {
    return res.status(400).send({error: 'Invalid updates!'})
  }

  try {
    const user = req.user
    updates.forEach((update) => user[update] = req.body[update])
    await user.save()

    res.send(user)
  } catch (e) {
    res.status(400).send(e)
  }
}

const deleteProfileUser = async (req, res) => {
  try {
    await req.user.deleteOne()
    await sendCancellationEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (e) {
    console.log(e)
    res.status(500).send(e)
  }
}

const uploadProfileAvatar = async (req, res) => {
  // Access uploaded file details from req.file
  const avatar = req.file;

  // Handle case where no file is uploaded
  if (!avatar) {
    return res.status(400).send({error: 'No file provided.'});
  }

  req.user.avatar = avatar.path

  await req.user.save()
  // You can now use the avatar data as needed (e.g., save file path to user profile)

  res.status(200).send({message: 'Avatar uploaded successfully.'});
}

const deleteProfileAvatar = async (req, res) => {
  try {
    const user = req.user;

    if (!user.avatar) {
      return res.status(404).send({ error: 'No avatar found.' });
    }

    await fs.promises.unlink(user.avatar);

    user.avatar = undefined;

    await user.save();

    res.status(200).send({ message: 'Avatar deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error.' });
  }
}

module.exports = {
  createUser,
  loginUser,
  logoutUser,
  logoutAllUser,
  getUsers,
  getProfileUser,
  getUserById,
  updateProfileUser,
  deleteProfileUser,
  uploadProfileAvatar,
  deleteProfileAvatar
}
