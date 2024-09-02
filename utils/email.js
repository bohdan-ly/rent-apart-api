const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");

module.exports = class Email {
  constructor(user, url, options) {
    this.url = url;
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.from = `Bohdan L <${process.env.EMAIL_FROM}>`;
    this.attachments = options?.attachments;
    this.member = options?.member;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // sendgrid
      // to test can try mailsac
      return nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.GMAIL_LOGIN,
          pass: process.env.GMAIL_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.GMAIL_LOGIN,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const templateVars = {
      firstName: this.firstName,
      url: this.url,
      subject,
    };

    if (this.member) {
      templateVars.memberName = this.member.name;
      templateVars.memberEmail = this.member.email;
    }

    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      templateVars
    );

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    if (this.attachments) {
      mailOptions.attachments = this.attachments;
    }
    // 3) Create a transport and send email
    // @ts-ignore
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Realty Rift Family");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }

  async sendEditRequest() {
    await this.send("editRequest", "Welcome to the ClipSwift Family 🎉");
  }
  async getEditRequest() {
    await this.send("getEditRequest", "New lead come to us! 🎉");
  }
};

// const sendEmail = async (options) => {
//   // 1) Create a transporter

//   const transporter = nodemailer.createTransport({
//     // @ts-ignore
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   // 2) Define the email options

//   const mailOptions = {
//     from: 'Bohdan L <bohdan@klevercompany.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html:
//   };

//   // 3) verify connection configuration
//   transporter.verify((error, success) => {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log('Server is ready to take our messages');
//     }
//   });

//   // 3) Actually send the email
//   // @ts-ignore
//   const mail = await transporter.sendMail(mailOptions);

//   console.log(`Preview URL: ${nodemailer.getTestMessageUrl(mail)}`);
// };

// module.exports = sendEmail;
