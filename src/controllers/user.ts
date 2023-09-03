import {IExpressRequest} from "../interfaces";
import {Response as ExpressResponse} from "express";
import * as ResponseManager from "../helpers/response.manager";
import * as userService from '../services/user.service'


export async function handleChangePassword(req:IExpressRequest,res:ExpressResponse):Promise<void>{
    const {oldPassword,newPassword} = req.body
    const deviceId = req.headers['x-device-id']
    const userId = req.userId!

    try{
        await userService.changePassword(
            {oldPassword,
                newPassword,
                deviceId:<string>deviceId,
                userId
            })

        ResponseManager.success(res,{message:"Password changed"})


    }catch (err){
        ResponseManager.handleError(res,err)
    }
}

export async function handleClockIn(req:IExpressRequest,res:ExpressResponse):Promise<void>{
    const userId = req.userId!
    try{

        await userService.clockIn(userId)
        ResponseManager.success(res,{message:"successfully clocked in"})


    }catch (err:any){
        ResponseManager.handleError(res,err)

    }
}


export async function handleClockOut(req:IExpressRequest,res:ExpressResponse):Promise<void>{
    const userId = req.userId!
    try{

        await userService.clockOut(userId)
        ResponseManager.success(res,{message:"successfully clocked out"})


    }catch (err:any){
        ResponseManager.handleError(res,err)

    }
}

export async function handleGetClockInDays(req:IExpressRequest,res:ExpressResponse):Promise<void>{
    const userId = req.userId!
    const {startDate,endDate,month} = req.query

    try{

        const days = await userService.getClockInDays({startDate:<string> startDate,endDate:<string>endDate,month:<string>month,userId})
        ResponseManager.success(res,{days})

    }catch (err:any){
        ResponseManager.handleError(res,err)

    }
}