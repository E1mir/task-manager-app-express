if (process.env.NODE_ENV !== 'production') {
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
const port = process.env.PORT

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


app.listen(port, () => {
  console.log(`Server is up on port: ${port}`)
})
