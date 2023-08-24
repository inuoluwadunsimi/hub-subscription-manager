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