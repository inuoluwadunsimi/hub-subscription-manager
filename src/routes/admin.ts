import express from "express";
import {config} from "../constants/settings";
import {handleAddUser} from "../controllers";
import {JwtHelper} from "../helpers/jwt/jwt.helper";
import {UserTokenDb} from "../models";
import {redisClient} from "../helpers/redis.connector";
import {JwtType} from "../interfaces";


const jwtHelper = new JwtHelper({
    privateKey: config.jwtPrivateKey,
    UserTokenDb,
    redisClient: redisClient,
})



const router = express.Router()


router.post('/add-user',jwtHelper.requirePermission(JwtType.ADMIN_USER),handleAddUser)

export default router;