import express from "express";
import {config} from "../constants/settings";
import authRoutes from "./auth"
import {handleChangePassword} from "../controllers";
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



router.use('/auth',authRoutes)

export default router