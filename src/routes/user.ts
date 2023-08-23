import express from "express";
import {config} from "../constants/settings";
import authRoutes from "./auth"


const router = express.Router()


router.use('/auth',authRoutes)

export default router