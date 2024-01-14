if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({path: './config/.env.test'})
} else if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({path: './config/.env.development'})
}

const express = require('express')
require('./db/mongoose')
const morgan = require('morgan');
const logger = require('./utils/logger');

const appRouter = require('./routers/app')
const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

const app = express()

const stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

app.use(express.json())
app.use(morgan('combined', {stream}))

app.use(appRouter)
app.use(userRouter)
app.use(taskRouter)

module.exports = app
