const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require("../../src/models/user");
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
  _id: userOneId,
  name: 'Elmir',
  email: 'elmir@example.com',
  password: 'pa55w0rd_t3st-us3r',
  tokens: [{
    token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
  }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
  _id: userTwoId,
  name: 'John',
  email: 'john@example.com',
  password: 'johndoe1441-space',
  tokens: [{
    token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
  }]
}

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Learn testing in Node.js',
  completed: true,
  owner: userOne._id
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Diving deeply into Node.js',
  completed: false,
  owner: userOne._id
}

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Continue learning Node.js',
  completed: true,
  owner: userOne._id
}

const taskFour = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Create a pet project by using Node.js',
  completed: true,
  owner: userTwo._id
}

const setupDatabase = async () => {
  await User.deleteMany()
  await Task.deleteMany()

  await User.bulkSave([
    new User(userOne),
    new User(userTwo)
  ])

  await Task.bulkSave([
    new Task(taskOne),
    new Task(taskTwo),
    new Task(taskThree),
    new Task(taskFour)
  ])
}

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase
}

