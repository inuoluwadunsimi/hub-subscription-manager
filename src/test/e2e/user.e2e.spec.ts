import {connectDBForTesting, dropAndDisconnectDBForTesting} from "../helpers/connect.db.for.testing";
import {redisClient} from "../../helpers/redis.connector";
import {adminsData} from "../data/admin.data";
import app from '../../app'
import {JwtHelper} from "../../helpers/jwt/jwt.helper";
import {faker} from "@faker-js/faker";
import {JwtType} from "../../interfaces";
import { userData} from "../data/user.data";
import request from "supertest";
import {AttendanceDb, SubscriptionDb, UserAuthDb, UserTokenDb} from "../../models";
import bcrypt from "bcrypt";

describe('user e2e',()=>{
    beforeAll(async ()=>{
        await connectDBForTesting()

        redisClient.get = jest.fn().mockImplementation((key: string) => {
            if (key.startsWith('capstone_token:')) {
                return Promise.resolve(adminsData.authToken);
            }
            return Promise.resolve(null);
        });
    })

    afterAll( async () => {
        await dropAndDisconnectDBForTesting();

    });


    it('should change password',(done)=>{

        UserAuthDb.findOne = jest.fn().mockResolvedValue({
            email:userData.email,
            password:userData.password,
            user:userData.id,
            recognisedDevices:[userData.deviceId]
        })

        UserAuthDb.updateOne = jest.fn().mockImplementation()
        UserTokenDb.deleteOne = jest.fn().mockImplementation()

        JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
            email: userData.email,
            userId: faker.string.uuid(),
            deviceId: userData.deviceId,
            type: JwtType.USER,

        })

        bcrypt.compare = jest.fn().mockResolvedValue(true)



        request(app)
            .post('/user/change-password')
            .set('x-device-id',userData.deviceId)
            .set('x-auth-token',userData.authToken)
            .send({
                oldPassword:userData.password,
                newPassword:userData.newPassword
            })
            .expect(200,async(err,res)=>{
                expect(res.body).toHaveProperty('message', 'Password changed');
                return done(err)
            })



    })

    it('should clock user in',(done)=>{
        JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
            email: userData.email,
            userId: faker.string.uuid(),
            deviceId: userData.deviceId,
            type: JwtType.USER,

        })
        SubscriptionDb.findOne = jest.fn().mockResolvedValue({})
        AttendanceDb.findOne = jest.fn().mockResolvedValue(null)
        request(app)
            .post('/user/subscription/clock-in')
            .set('x-auth-token',userData.authToken)
            .expect(200,async(err,res)=>{
                expect(res.body).toHaveProperty('message', 'successfully clocked in');
                return done(err)
            })

    })


    it('should throw error if already clocked-in /400 ERROR',(done)=>{
        JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
            email: userData.email,
            userId: faker.string.uuid(),
            deviceId: userData.deviceId,
            type: JwtType.USER,

        })
        SubscriptionDb.findOne = jest.fn().mockResolvedValue({})
        AttendanceDb.findOne = jest.fn().mockResolvedValue({})
        request(app)
            .post('/user/subscription/clock-in')
            .set('x-auth-token',userData.authToken)
            .expect(400,async(err,res)=>{
                expect(res.body).toHaveProperty('message', 'already clocked in');
                return done(err)
            })

    })



    it('should clock user out',(done)=>{
        JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
            email: userData.email,
            userId: faker.string.uuid(),
            deviceId: userData.deviceId,
            type: JwtType.USER,

        })
        AttendanceDb.updateOne = jest.fn().mockImplementation()
        request(app)
            .post('/user/subscription/clock-out')
            .set('x-auth-token',userData.authToken)
            .expect(200,async(err,res)=>{
                expect(res.body).toHaveProperty('message', 'successfully clocked out');
                return done(err)
            })

    })

    it('should get users clock-in days',(done)=>{

        JwtHelper.prototype.verifyToken = jest.fn().mockReturnValueOnce({
            email: userData.email,
            userId: faker.string.uuid(),
            deviceId: userData.deviceId,
            type: JwtType.USER,

        })
        // AttendanceDb.find =  jest.fn().mockResolvedValue(mockAttendance)
        // jest.spyOn(AttendanceDb.find,'countDocuments').mockResolvedValue(mockAttendance.count)

        request(app)
            .get('/user/attendance')
            .set('x-auth-token',userData.authToken)
            .expect(200,async(err,res)=>{
                expect(res.body).toHaveProperty('days' );
                return done(err)
            })


    })

})