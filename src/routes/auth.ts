import express from "express";
import {config} from "../constants/settings";

import {
    handleEmailSignup,
    handleForgotPasswordOtpRequest,
    handleGoogleAuth,
    handleLogin, handleResetPassword,
    handleVerifyDevice, handleVerifyForgotPasswordOtpRequest
} from "../controllers";
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


router.post('/signup',handleEmailSignup)
router.post('/google-auth',handleGoogleAuth)
router.post('/login',handleLogin)
router.post('/verify-device',handleVerifyDevice)
//forgot password endpoints

router.post('/forgotpassword/otp-request',handleForgotPasswordOtpRequest )

router.post('/forgotpassword/otp-verify',handleVerifyForgotPasswordOtpRequest )

router.post('/forgotpassword/password-reset', jwtHelper.requirePermission(JwtType.NEW_USER),handleResetPassword)
export default router