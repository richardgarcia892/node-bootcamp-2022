const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  createTransport() {
    let host;
    let port;
    let auth;

    if (process.env.NODE_ENV === 'production') {
      host = process.env.SENDGRID_EMAIL_HOST;
      port = process.env.SENDGRID_EMAIL_PORT;
      auth = {
        user: process.env.SENDGRID_EMAIL_USERNAME,
        pass: process.env.SENDGRID_EMAIL_PASSWORD
      };
    } else {
      host = process.env.MAILTRAP_EMAIL_HOST;
      port = process.env.MAILTRAP_EMAIL_PORT;
      auth = {
        user: process.env.MAILTRAP_EMAIL_USERNAME,
        pass: process.env.MAILTRAP_EMAIL_PASSWORD
      };
    }
    const transporter = nodemailer.createTransport({ host, port, auth });
    return transporter;
  }

  async send(template, subject) {
    // Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: this.to,
      subject: subject,
      text: htmlToText.convert(html),
      html
    };
    // Create transport and send email
    await this.createTransport().sendMail(mailOptions);
  }

  async sendWellcome() {
    await this.send('welcome', 'Wellcome to the family');
  }

  async sendPasswordRecovery() {
    await this.send('passwordReset', 'Password reset request - valid for 10 minutes');
  }
};
