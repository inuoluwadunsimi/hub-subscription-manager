import {BadRequestError, IExpressRequest, UserType} from "../interfaces";
import {Response as ExpressResponse} from 'express';
import * as ResponseManager from '../helpers/response.manager'
import * as adminService from '../services/admin.service'
import * as authService from '../services/auth.service'


export async function handleGoogleAuth(req:IExpressRequest,res:ExpressResponse):Promise<void>{
    const {email,googleToken,role} = req.body
    const deviceId = req.headers['x-device-id']

    try{
        if(role === UserType.ADMIN){
            const token = await adminService.adminGoogleSignin({googleToken,deviceId:<string>deviceId})
            res.cookie('x-auth-token',token,{httpOnly:true})
            ResponseManager.success(res,{message:'admin successfully signed in'})
        }else if(role === UserType.USER){
            const data = await authService.userGoogleAuth({email,googleToken,deviceId:<string>deviceId})
            ResponseManager.success(res,{data})

        }else{
            throw new BadRequestError('specify role')
        }

    }catch (err){
        ResponseManager.handleError(res,err)
    }
}