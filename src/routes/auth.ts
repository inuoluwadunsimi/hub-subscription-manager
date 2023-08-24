import express from "express";
import {config} from "../constants/settings";

import {handleEmailSignup, handleGoogleAuth, handleLogin, handleVerifyDevice} from "../controllers";


const router = express.Router()


router.post('/signup',handleEmailSignup)
router.post('/google-auth',handleGoogleAuth)
router.post('/login',handleLogin)
router.post('/verify-device',handleVerifyDevice)
router.post('/change-password',)

export default router