const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
require("dotenv").config();

module.exports = class Email {
    constructor(userName, userEmail, userPhn, url) {
        this.name = userName;
        this.to = userEmail;
        this.userPhn = userPhn,
            this.url = url;
        this.from = `Ev Franchise Station <grow@boomzo.in>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === "production") {
            console.log("PRod");
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USERNAME,
                    pass: process.env.GMAIL_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async send(template, subject) {
        // 1) Render HTML based on a pug template
        console.log(`${__dirname}/../view/${template}.pug`);
        const html = pug.renderFile(`${__dirname}/../view/${template}.pug`, {
            firstName: this.name,
            url: this.url,
            subject,
        });

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            // text: htmlToText.fromString(html),
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async booking(template, sub) {

        let mailList = ["grow@boomzo.in"];
        mailList.push(this.to);
        console.log(mailList);

        console.log(`${__dirname}/../view/${template}.pug`);
        const html = pug.renderFile(`${__dirname}/../view/${template}.pug`, {
            firstName: this.name,
            url: this.url,
            subject: sub,
            service: this.service,
        });

        const mailOptions = {
            from: this.from,
            bcc: mailList,
            subject: sub,
            html,
        };

        await this.newTransport().sendMail(mailOptions);
    }

    async sendPasswordReset() {
        await this.send(
            "passwordReset",
            "Your password reset token (valid for only 10 minutes)"
        );
    }

    async sendBookingInfo() {
        await this.send(
            "booking",
            "We have received your EV Station Booking Request"
        );
    }


};
