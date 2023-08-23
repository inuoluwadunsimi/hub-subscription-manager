import * as nodemailer from 'nodemailer'
import {config} from "../constants/settings";


const transporter = nodemailer.createTransport({
    service: 'gmail',
    // Mail service would be upgraded to mailjet eventually
    auth: {
        user: config.admin.email,
        pass: config.mailing.gmail_pass
    }

})

export const Mailer = {
    sender: config.admin.email,
    link: "https://opolo.global/",

    sendSignupMail: async function ( email: string) {
        console.log(config.mailing.gmail_pass)

        await transporter.sendMail({
            to: email,
            from: this.sender,
            subject: 'GLOUSE SIGNUP: VERIFY YOUR EMAIL',
            html: `<p> Welcome, signup by using this link ${this.link}/signup/:${email}</p>`

        })

    },
    sendWelcomeMail: async function (email: string) {
        await transporter.sendMail({
            to: email,
            from: this.sender,
            subject: 'WELCOME TO A WORLD OF CONVENIENCE',
            html: `<p> Welcome to glouse, when you go order?<p/>`
        })
    },
    sendVerifyDeviceOtp: async function (email: string, otp: string) {
        await transporter.sendMail({
            to: email,
            from: this.sender,
            subject: 'VERIFY THIS IS YOU',
            html: `<p>We noticed you signed up from a different device, kindly verify if this signup was made by you using this ${otp}</p>`

        })
    },
    sendForgotPasswordOtp: async function (email: string, otp: string) {
        await transporter.sendMail({
            to: email,
            from: this.sender,
            subject: 'FORGOT PASSWORD OTP REQUEST',
            html: '<p> Kindly use this otp to retrieve your password </p>',

        })
    }
}