const sgMail = require('@sendgrid/mail')
const {generateWelcomeTemplate} = require('./templates/welcome')
const {generateGoodbyeTemplate} = require("./templates/goodbye");

const sendgridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = async (email, name) => {
  if (process.env.NODE_ENV === 'production') {
    await sgMail.send({
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: 'Thanks for joining in!',
      html: generateWelcomeTemplate(name)
    })
  }
}

const sendCancellationEmail = async (email, name) => {
  if (process.env.NODE_ENV === 'production') {
    await sgMail.send({
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: 'Sorry to see you go!',
      html: generateGoodbyeTemplate(name)
    })
  }
}


module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail
}
