const request = require('supertest')

const app = require('../src/app')
const Task = require('../src/models/task')
const {
  userOne,
  userTwo,
  taskOne,
  taskTwo,
  setupDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'Test task'
    })
    .expect(201)

  const task = await Task.findById(response.body._id)
  expect(task).not.toBeNull()
  expect(task.completed).toEqual(false)
})


test('Should not create task for unauthenticated user', async () => {
  await request(app)
    .post('/tasks')
    .send({
      description: 'Test task'
    })
    .expect(401)
})

test('Should not create task with invalid payload', async () => {
  // Empty description
  await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: ' '
    })
    .expect(400)

  // Invalid completed value
  await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      completed: 'yes'
    })
    .expect(400)
})

test('Should fetch user tasks', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
  expect(response.body.tasks.length).toEqual(3)
})

test('Should fetch only completed tasks', async () => {
  const response = await request(app)
    .get('/tasks')
    .query({
      completed: true
    })
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
  expect(response.body.tasks.length).toEqual(2)
})

test('Should fetch only uncompleted tasks', async () => {
  const response = await request(app)
    .get('/tasks')
    .query({
      completed: false
    })
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.tasks.length).toEqual(1)
})

test('Should fetch by limit', async () => {
  const response = await request(app)
    .get('/tasks')
    .query({
      limit: 2
    })
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.tasks.length).toEqual(2)
  expect(response.body.totalPages).toEqual(2)
})

test('Should fetch by page', async () => {
  const response = await request(app)
    .get('/tasks')
    .query({
      limit: 2,
      page: 2
    })
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.tasks.length).toEqual(1)
  expect(response.body.totalPages).toEqual(2)
})

test('Should sort tasks in descending order by completion status', async () => {
  const response = await request(app)
    .get('/tasks')
    .query({
      sortBy: 'completed:desc'
    })
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.tasks[0].completed).toBe(true);
  expect(response.body.tasks[1].completed).toBe(true);
  expect(response.body.tasks[2].completed).toBe(false);
})

test('Should sort tasks in ascending order by completion status', async () => {
  const response = await request(app)
    .get('/tasks')
    .query({
      sortBy: 'completed:asc'
    })
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.tasks[0].completed).toBe(false);
  expect(response.body.tasks[1].completed).toBe(true);
  expect(response.body.tasks[2].completed).toBe(true);
})


test('Should fetch user specific task', async () => {
  const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
  expect(response.body.description).toEqual(taskOne.description)
})

test('Should not fetch user specific task if unauthenticated', async () => {
  await request(app)
    .get(`/tasks/${taskOne._id}`)
    .send()
    .expect(401)
})

test('Should update task', async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'Update task in test',
      completed: true
    })
    .expect(200)

  const task = await Task.findById(taskOne._id)
  expect(task.description).toEqual('Update task in test')
  expect(task.completed).toEqual(true)
})

test('Should not update with invalid payload', async () => {

  // Invalid empty description
  request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: '  ',
    })
    .expect(400)

  // Invalid completed value
  request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      completed: 'No',
    })
    .expect(400)

  const task = await Task.findById(taskOne._id)
  expect(task.description).toEqual(taskOne.description)
  expect(task.completed).toEqual(taskOne.completed)
})

test('Should not update other user tasks', async () => {
  await request(app)
    .patch(`/tasks/${taskTwo._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
      description: 'Updated task two'
    })
    .expect(404)

  const task = await Task.findById(taskTwo._id)
  expect(task.description).toEqual(taskTwo.description)
})

test('Should not update if unauthenticated', async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .send({
      description: 'Updated task'
    })
    .expect(401)
})

test('Should delete user task', async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  const task = await Task.findById(taskOne._id)
  expect(task).toBeNull()
})

test('Should not delete other users tasks', async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

  const task = await Task.findById(taskOne._id)
  expect(task).not.toBeNull()
})
