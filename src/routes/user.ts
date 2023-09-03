import express from "express";
import {config} from "../constants/settings";
import authRoutes from "./auth"
import {handleChangePassword, handleClockIn, handleClockOut, handleGetClockInDays} from "../controllers";
import {JwtHelper} from "../helpers/jwt/jwt.helper";
import {JwtType} from "../interfaces";
import {UserTokenDb} from "../models";
import {redisClient} from "../helpers/redis.connector";

const jwtHelper = new JwtHelper({
    privateKey: config.jwtPrivateKey,
    UserTokenDb,
    redisClient: redisClient,
})

const router = express.Router()

router.post('/change-password',jwtHelper.requirePermission(JwtType.USER),handleChangePassword)
router.post('/subscription/clock-in',jwtHelper.requirePermission(JwtType.USER),handleClockIn)
router.post('/subscription/clock-out',jwtHelper.requirePermission(JwtType.USER),handleClockOut)
router.get('/attendance',jwtHelper.requirePermission(JwtType.USER),handleGetClockInDays)



router.use('/auth',authRoutes)

export default router