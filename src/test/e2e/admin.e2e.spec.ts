///<reference path="../../../node_modules/@types/jest/index.d.ts"/>

import {JwtHelper} from "../../helpers/jwt/jwt.helper";
import {adminData, adminsData} from "../data/admin.data";
import {connectDBForTesting,dropAndDisconnectDBForTesting} from "../helpers/connect.db.for.testing";
import request from 'supertest'
import app from '../../app'
import {userData, users} from "../data/user.data";
import {JwtType, User} from "../../interfaces";
import {faker} from "@faker-js/faker";
import {redisClient} from "../../helpers/redis.connector";
import {Mailer} from "../../mailing/mail.service";
import {AttendanceDb, SubscriptionDb, UserDb} from "../../models";


describe( 'admin e2e', ()=>{
    beforeAll(async()=>{
        await connectDBForTesting()
        redisClient.get = jest.fn().mockImplementation((key: string) => {
            if (key.startsWith('capstone_token:')) {
                return Promise.resolve(adminsData.authToken);
            }
            return Promise.resolve(null);
        });
        JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
            email: adminsData.email,
            userId: faker.string.uuid(),
            deviceId: adminsData.deviceId,
            type: JwtType.ADMIN_USER
        })

    })

    afterAll( async () => {
        await dropAndDisconnectDBForTesting();

    });


    it('should addUser',   (done ) => {


        Mailer.sendSignupMail = jest.fn().mockImplementation(function (){
            console.log('mock mailing')
        })


        request(app)
            .post('/admin/users')
            .set('Cookie',`x-auth-token=${adminsData.authToken}`)
            .send({email: userData.email})

            .expect(200, async (err, res) => {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                expect(res.body).toHaveProperty('message', 'signup mail sent to user');
                done();
            })


    })

    it('should get all users',(done)=>{
        JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
            email: adminsData.email,
            userId: faker.string.uuid(),
            deviceId: adminsData.deviceId,
            type: JwtType.ADMIN_USER
        })

        request(app)
            .get('/admin/users')
            .set('Cookie',`x-auth-token=${adminsData.authToken}`)
            .expect(200,async(err,res)=>{
                if (err) {
                    console.log(err);
                    return done(err);
                }
                expect(res.body).toHaveProperty("users")
                done()
            })





    })


it('should create subscription',(done)=>{
    JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
        email: adminsData.email,
        userId: faker.string.uuid(),
        deviceId: adminsData.deviceId,
        type: JwtType.ADMIN_USER
    })
    UserDb.findOne = jest.fn().mockResolvedValue({id:faker.string.uuid(),email:userData.email,fullName:userData.fullName})
    request(app)
        .post('/admin/subscription')
        .set('Cookie',`x-auth-token=${adminsData.authToken}`)
        .send({
            email: userData.email,
            schedule:'monthly',
            paymentStatus:'paid',
            subscriptionStatus:'active',

        })
        .expect(200,async (err,res)=>{
            if (err) {
                console.log(err);
                return done(err);
            }
            expect(res.body).toHaveProperty('message','subscription successfully created')
            done()
        })

})
    it('should not create subscription,throw 404',(done)=>{
        JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
            email: adminsData.email,
            userId: faker.string.uuid(),
            deviceId: adminsData.deviceId,
            type: JwtType.ADMIN_USER
        })
        UserDb.findOne = jest.fn().mockResolvedValue(null)
        request(app)
            .post('/admin/subscription')
            .set('Cookie',`x-auth-token=${adminsData.authToken}`)
            .send({
                email: userData.email,
                schedule:'monthly',
                paymentStatus:'paid',
                subscriptionStatus:'active',

            })
            .expect(404,async (err,res)=>{
                if (err) {
                    console.log(err)
                    return done(err)
                }
                expect(UserDb.findOne).toHaveBeenCalledWith({email:userData.email})
                expect(res.body).toHaveProperty('message','user has not been created')
                done()



            })

    })
    it('should change payment status',(done)=>{
        JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
            email: adminsData.email,
            userId: faker.string.uuid(),
            deviceId: adminsData.deviceId,
            type: JwtType.ADMIN_USER
        })
        SubscriptionDb.findOne = jest.fn().mockResolvedValue(
            {
                id:userData.id,
                email:userData.email,
                fullName:userData.fullName,
                user:'2224',
                schedule:'monthly',
                startDate:faker.date.anytime(),
                subscriptionStatus:'active',
                paymentStatus:'owing',
                save: jest.fn().mockResolvedValue(undefined), // Mock the save function
            })

        request(app)
            .put(`/admin/subscription/payment/${userData.id}`)
            .set('Cookie',`x-auth-token=${adminsData.authToken}`)
            .send({
                paymentStatus:'paid',
            })
            .expect(200, async(err,res)=>{
                if (err) {
                    console.log(err)
                }
                expect(res.body).toHaveProperty("message","payment status changed")
                return done(err)

            } )


    })


    it('should change subscription status',(done)=>{
        JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
            email: adminsData.email,
            userId: faker.string.uuid(),
            deviceId: adminsData.deviceId,
            type: JwtType.ADMIN_USER
        })
        SubscriptionDb.findOne = jest.fn().mockResolvedValue(
            {
                id:userData.id,
                email:userData.email,
                fullName:userData.fullName,
                user:'2224',
                schedule:'monthly',
                startDate:faker.date.anytime(),
                subscriptionStatus:'active',
                paymentStatus:'owing',
                save: jest.fn().mockResolvedValue(undefined), // Mock the save function
            })

        request(app)
            .put(`/admin/subscription/status/${userData.id}`)
            .set('Cookie',`x-auth-token=${adminsData.authToken}`)
            .send({
                subscriptionStatus:'suspended',
            })
            .expect(200, async(err,res)=>{
                if (err) {
                    console.log(err)
                }
                expect(res.body).toHaveProperty("message","subscription status changed")
                return done(err)

            } )


    })

    it('should edit clock-in',(done)=>{
        JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
            email: adminsData.email,
            userId: faker.string.uuid(),
            deviceId: adminsData.deviceId,
            type: JwtType.ADMIN_USER
        })

        AttendanceDb.updateOne = jest.fn().mockImplementation()

        request(app)
            .put(`/admin/attendance/${userData.id}`)
            .set('Cookie',`x-auth-token=${adminsData.authToken}`)
            .send({
                date: faker.date.anytime(),
                clockInTime:faker.string.numeric(),
                clockOutTime:faker.string.numeric(),
            })
            .expect(200,async (err,res)=>{
                expect(res.body).toHaveProperty("message","successfully edited clockIn details")
                return done(err)

        })

    })


})


