import express from "express";
import {config} from "../constants/settings";

import {handleGoogleAuth} from "../controllers";


const router = express.Router()


router.use('/google-auth',handleGoogleAuth)

export default router