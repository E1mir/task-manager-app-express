const Task = require("../models/task");

const createTask = async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })
  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
}

const getTasks = async (req, res) => {
  const match = {}
  const sort = {}
  const limit = parseInt(req.query.limit) || 10
  let page = parseInt(req.query.page) || 1

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    const totalTasks = await Task.countDocuments({owner: req.user._id, ...match})
    const totalPages = Math.ceil(totalTasks / limit)
    if (page > totalPages) page = totalPages

    const skip = (page - 1) * limit

    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit,
        skip,
        sort
      }
    })
    res.send({
      tasks: req.user.tasks,
      page,
      totalPages
    })
  } catch (e) {
    res.status(500).send(e)
  }
}

const getTaskById = async (req, res) => {
  const _id = req.params.id

  try {
    const task = await Task.findOne({_id, owner: req.user._id})

    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
}

const updateTaskById = async (req, res) => {
  const _id = req.params.id
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValid = updates.every((update) => allowedUpdates.includes(update))

  if (!isValid) {
    return res.send(400).send({error: 'Invalid updates!'})
  }

  try {
    const task = await Task.findOne({_id, owner: req.user._id})

    if (!task) {
      return res.status(404).send()
    }

    updates.forEach((update) => task[update] = req.body[update])

    await task.save()

    res.send(task)
  } catch (e) {
    res.status(400).send(e)
  }
}

const deleteTaskById = async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOneAndDelete({_id, owner: req.user._id})
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTaskById,
  deleteTaskById
}
