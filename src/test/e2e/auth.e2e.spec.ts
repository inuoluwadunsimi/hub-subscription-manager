import {connectDBForTesting, dropAndDisconnectDBForTesting} from "../helpers/connect.db.for.testing";
import {redisClient} from "../../helpers/redis.connector";
import {adminData, adminsData} from "../data/admin.data";
import request from "supertest";
import app from '../../app'
import {userData} from "../data/user.data";
import {AuthType, JwtType, UserType} from "../../interfaces";
import * as GoogleModule from "../../helpers/google.helper"
import {UserAuthDb, UserDb, UserTokenDb, UserVerDb} from "../../models";
import {JwtHelper} from "../../helpers/jwt/jwt.helper";
import {Mailer} from "../../mailing/mail.service";
import bcrypt from "bcrypt";
import * as OtpModule from "../../helpers/utils";
import {faker} from "@faker-js/faker";

describe("auth e2e",()=> {
    beforeAll(async () => {
        await connectDBForTesting()

        redisClient.get = jest.fn().mockImplementation((key: string) => {
            if (key.startsWith('capstone_token:')) {
                return Promise.resolve(adminsData.authToken);
            }
            return Promise.resolve(null);
        });
    })


    afterAll(async () => {
        await dropAndDisconnectDBForTesting();

    });


    it('should authorise admin login', (done) => {

        jest
            .spyOn(GoogleModule, 'verifyGoogleToken')
            .mockResolvedValue({email: adminData.email, iss: 'djdjd', sub: 'djdjd', aud: 'dkdd', iat: 22, exp: 11});
        UserDb.findOne = jest.fn().mockResolvedValue({})

        request(app)
            .post('/user/auth/google-auth')
            .set('x-device-id', userData.deviceId)
            .send({
                email: adminData.email,
                role: UserType.ADMIN,
                googleToken: adminsData.googleToken
            })
            .expect(200, async (err, res) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                expect(res.body).toHaveProperty("message", 'admin successfully signed in')
                return done(err)
            })
    })

    it('should log user in with googleAuth', (done) => {
        jest
            .spyOn(GoogleModule, 'verifyGoogleToken')
            .mockResolvedValue({email: userData.email, iss: 'djdjd', sub: 'djdjd', aud: 'dkdd', iat: 22, exp: 11});
        UserDb.findOne = jest.fn().mockResolvedValue({})
        UserAuthDb.findOne = jest.fn().mockResolvedValue({
            type: AuthType.GOOGLE,
            recognisedDevices: [userData.deviceId],
            user: userData.id,
            save: jest.fn().mockImplementation()
        })

        JwtHelper.prototype.generateToken = jest.fn().mockReturnValueOnce(userData.loginToken)


        request(app)
            .post('/user/auth/google-auth')
            .set('x-device-id', userData.deviceId)
            .send({
                email: adminData.email,
                role: UserType.USER,
                googleToken: adminsData.googleToken
            })
            .expect(200, async (err, res) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                expect(res.body.data).toHaveProperty("token", userData.loginToken)
                return done(err)
            })
    })


    it('should sign user up with google auth', (done) => {
        jest
            .spyOn(GoogleModule, 'verifyGoogleToken')
            .mockResolvedValue({email: userData.email, iss: 'djdjd', sub: 'djdjd', aud: 'dkdd', iat: 22, exp: 11});
        UserDb.findOne = jest.fn().mockResolvedValue({})
        UserAuthDb.findOne = jest.fn().mockResolvedValue(null)

        UserDb.updateOne = jest.fn().mockImplementation()
        UserAuthDb.create = jest.fn().mockResolvedValue({user: userData.id})
        UserTokenDb.create = jest.fn().mockImplementation()

        JwtHelper.prototype.generateToken = jest.fn().mockReturnValueOnce(userData.loginToken)
        Mailer.sendWelcomeMail = jest.fn().mockImplementation(function () {
            console.log('mock mailing')
        })


        request(app)
            .post('/user/auth/google-auth')
            .set('x-device-id', userData.deviceId)
            .send({
                email: userData.email,
                role: UserType.USER,
                googleToken: adminsData.googleToken
            })
            .expect(200, async (err, res) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                expect(res.body.data).toHaveProperty("token", userData.loginToken)
                return done(err)
            })
    })


    it('should throw error if device is unreognised', (done) => {
        JwtHelper.prototype.generateToken = jest.fn().mockReturnValueOnce(userData.loginToken)
        UserAuthDb.findOne = jest.fn().mockReturnValueOnce({password: userData.newPassword, recognisedDevices: [...userData.deviceId]})
        bcrypt.compare = jest.fn().mockResolvedValue(true)
        Mailer.sendVerifyDeviceOtp = jest.fn().mockImplementation(function () {
            console.log('mock mailing')
        })


        request(app)
            .post('/user/auth/login')
            .set('x-device-id', userData.deviceId)
            .send({
                email: userData.email,
                password: userData.newPassword
            })
            .expect(400, async (err, res) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                expect(res.body).toHaveProperty("message", "This device is unrecognised, an otp has been sent to your mail to verify the account")
                return done(err)
            })


    })


    it('should verify device otp', (done) => {
        JwtHelper.prototype.generateToken = jest.fn().mockReturnValueOnce(userData.loginToken)
        UserTokenDb.updateOne = jest.fn().mockImplementation()
        UserAuthDb.findOne = jest.fn().mockResolvedValue({})
        UserVerDb.findOne = jest.fn().mockResolvedValue({deleteOne: jest.fn().mockImplementation()})
        request(app)
            .post('/user/auth/verify-device')
            .set('x-device-id', '1234')
            .send({
                email: userData.email,
                otp: userData.otp,
                trustDevice: false,
            })
            .expect(200, async (err, res) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                expect(res.body.data).toHaveProperty("token", userData.loginToken)
                return done(err)
            })


    })


    it('log user in', (done) => {
        JwtHelper.prototype.generateToken = jest.fn().mockReturnValueOnce(userData.loginToken)
        UserAuthDb.findOne = jest.fn().mockReturnValueOnce({password: userData.newPassword, recognisedDevices: ['234', '1234']})
        bcrypt.compare = jest.fn().mockResolvedValue(true)


        request(app)
            .post('/user/auth/login')
            .set('x-device-id', '1234')
            .send({
                email: userData.email,
                password: userData.newPassword
            })
            .expect(200, async (err, res) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                expect(res.body.data).toHaveProperty("token", userData.loginToken)
                return done(err)
            })


    })

    it('should request forgotPassword otp', (done) => {

        UserDb.findOne = jest.fn().mockResolvedValue({})
        UserVerDb.findOne = jest.fn().mockReturnValueOnce(null)
        Mailer.sendForgotPasswordOtp = jest.fn().mockImplementation()


            jest
                .spyOn(OtpModule, 'generateOtp')
                .mockReturnValueOnce(userData.otp);
            request(app)
                .post('/user/auth/forgotpassword/otp-request')
                .set('x-device-id', '1234')
                .send({
                    email: userData.email,
                })
                .expect(200, async (err, res) => {
                    if (err) {
                        console.log(err);
                        return done(err);
                    }
                    expect(res.body).toHaveProperty("message", "Otp successfully sent")
                    return done(err)
                })

    })



    it('should verify forgotPassword otp', (done) => {

        JwtHelper.prototype.generateToken = jest.fn().mockReturnValueOnce(userData.forgotPasswordAuthToken)

        UserDb.findOne = jest.fn().mockResolvedValue({})
        UserVerDb.findOne = jest.fn().mockReturnValueOnce({deleteOne:jest.fn().mockImplementation()})
        Mailer.sendForgotPasswordOtp = jest.fn().mockImplementation()

        request(app)
            .post('/user/auth/forgotpassword/otp-verify')
            .set('x-device-id', '1234')
            .send({
                email: userData.email,
            })
            .expect(200, async (err, res) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                expect(res.body).toHaveProperty("token", userData.forgotPasswordAuthToken)
                return done(err)
            })

    })


    it('should reset password',(done)=>{
        JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
            email: userData.email,
            userId: faker.string.uuid(),
            deviceId: userData.deviceId,
            type: JwtType.NEW_USER,

        })
        UserAuthDb.findOne = jest.fn().mockReturnValueOnce({password:userData.password,save:jest.fn().mockImplementation()})
        UserDb.findOne = jest.fn().mockReturnValueOnce({id:userData.id})
        bcrypt.hash = jest.fn().mockImplementation()

        JwtHelper.prototype.generateToken = jest.fn().mockReturnValueOnce(userData.loginToken)
        request(app)
            .post('/user/auth/forgotpassword/password-reset')
            .set('x-device-id', userData.deviceId)
            .set('x-auth-token',userData.authToken)
            .send({
                password: userData.newPassword,
            })
            .expect(200, async (err, res) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                expect(res.body.token).toHaveProperty("token", userData.loginToken)
                return done(err)
            })
    })
})