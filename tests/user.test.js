const request = require('supertest')

const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
  const response = await request(app).post('/users').send({
    name: 'Elmir',
    email: 'mrelmirismayilzade@gmail.com',
    password: 'qwe1221',
    age: 26
  }).expect(201)

  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()
  expect(response.body).toMatchObject({
    user: {
      name: 'Elmir',
      email: 'mrelmirismayilzade@gmail.com',
      age: 26
    },
    token: user.tokens[0].token
  })
  expect(user.password).not.toBe('qwe1221')
})


test('Should not signup user with invalid name/email/password', async () => {
  // Invalid name
  await request(app).post('/users').send({
    name: '  ',
    email: 'test@example.com',
    password: 'qwe1221'
  }).expect(400)

  // Invalid email
  await request(app).post('/users').send({
    name: 'Name Surname',
    email: 'nonemail',
    password: 'qwe1221'
  }).expect(400)

  // Invalid password
  await request(app).post('/users').send({
    name: 'Name Surname',
    email: 'test@example.com',
    password: 'qqq'
  }).expect(400)
})

test('Should login existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)

  const user = await User.findById(response.body.user._id)

  expect(response.body.token).toBe(user.tokens[1].token)

})

test('Should not login with incorrect credentials', async () => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: 'another_password'
  }).expect(400)
})

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload and delete avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user.avatar).not.toBeNull()
  expect(user.avatar).toContain(`avatar_${userOneId}`)

  await request(app)
    .delete('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
  const userWithDeletedAvatar = await User.findById(userOneId)
  expect(userWithDeletedAvatar.avatar).toBeUndefined()
})

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Updated name',
      email: 'updated@example.com',
      age: 25,
    })
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.name).toBe('Updated name')
  expect(user.age).toBe(25)
  expect(user.email).toBe('updated@example.com')
})

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Wroclaw'
    })
    .expect(400)
})

