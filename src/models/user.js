const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Task = require('./task')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate(v) {
      if (!validator.isEmail(v)) {
        throw new Error('Email is invalid!')
      }
    }
  },
  password: {
    type: String,
    required: true,
    minLength: 7,
    trim: true,
    validate(v) {
      if (v.toLowerCase().includes('password')) {
        throw new Error('Weak password')
      }
    }
  },
  age: {
    type: Number,
    validate: (v) => {
      if (v < 0) {
        throw new Error('Age must be a positive number')
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: String
  }
}, {
  timestamps: true
})


userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign(
    {_id: user._id.toString()},
    process.env.JWT_SECRET,
    {expiresIn: '14 days'}
  )

  user.tokens = user.tokens.concat({token})
  await user.save()

  return token
}

// Hiding password and token
userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens

  return userObject
}

// Method for login
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({email})

  if (!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Unable to login')
  }

  return user
}


// Hashing password
userSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

// Cascade task delete
userSchema.pre('deleteOne', {document: true, query: false}, async function (next) {
  const user = this
  await Task.deleteMany({owner: user._id})
  next()
})


const User = mongoose.model('User', userSchema)

module.exports = User
