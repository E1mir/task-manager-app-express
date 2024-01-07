const express = require('express')
const taskController = require('../controllers/taskController')

const auth = require('../middleware/auth')

const router = express.Router()

// POST
router.post('/tasks', auth, taskController.createTask)

// GET
router.get('/tasks', auth, taskController.getTasks)
router.get('/tasks/:id', auth, taskController.getTaskById)

// PATCH
router.patch('/tasks/:id', auth, taskController.updateTaskById)

// DELETE
router.delete('/tasks/:id', auth, taskController.deleteTaskById)

module.exports = router
