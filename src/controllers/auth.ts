import {BadRequestError, IExpressRequest, UserType} from "../interfaces";
import {Response as ExpressResponse} from 'express';
import * as ResponseManager from '../helpers/response.manager'
import * as adminService from '../services/admin.service'
import * as authService from '../services/auth.service'


export async function handleGoogleAuth(req:IExpressRequest,res:ExpressResponse):Promise<void>{
    const {email,googleToken,role} = req.body
    const deviceId = req.headers['x-device-id']

    try{
        // call service based on user type
        if(role === UserType.ADMIN){
            const token = await adminService.adminGoogleSignin({googleToken,deviceId:<string>deviceId})
            // send jwt in http-only cookie
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

export async function handleEmailSignup(req:IExpressRequest,res:ExpressResponse):Promise<void>{
    const {email,password,fullName} = req.body
    const deviceId = req.headers['x-device-id']
    try{
        const data = await authService.emailSignup({email,password,fullName,deviceId:<string>deviceId})
        ResponseManager.success(res,{data})

    }catch (err){
        ResponseManager.handleError(res,err)
    }
}

export async function handleLogin(req:IExpressRequest,res:ExpressResponse):Promise<void>{
    const {email,password} = req.body
    const deviceId = req.headers['x-device-id']



    try{
        const data = await authService.Login({
            email,
            password,
            deviceId:<string>deviceId,
        })

        ResponseManager.success(res,{data})

    }catch (err){
        ResponseManager.handleError(res,err)
    }
}

export async function handleVerifyDevice(req:IExpressRequest,res:ExpressResponse):Promise<void>{
    const {email,otp,trustDevice} = req.body
    const deviceId = req.headers['x-device-id']

    try{
        const data = await authService.verifyDevice({
            email,
            otp,
            deviceId:<string>deviceId,
            trustDevice
        })
        ResponseManager.success(res,{data})
    }catch (err){
        ResponseManager.handleError(res,err)
    }
}

export async function handleForgotPasswordOtpRequest(req:IExpressRequest, res: ExpressResponse): Promise<void> {
    const {email} = req.body
    const deviceId = req.headers['x-device-id']

    try {
        await authService.sendForgotPasswordOtp({
            email,
            deviceId: <string>deviceId,
        });

        ResponseManager.success(res, {message: 'Otp successfully sent'});
    } catch (err) {
        ResponseManager.handleError(res, err);
    }
}

export async function handleVerifyForgotPasswordOtpRequest(req:IExpressRequest, res: ExpressResponse): Promise<void> {
    const {email, otp} = req.body;
    const deviceId = req.headers['x-device-id'];
    try {
        const token = await authService.verifyForgotPasswordOtpRequest({
            email,
            otp,
            deviceId: <string>deviceId,
        });

        ResponseManager.success(res, {token});
    } catch (err) {
        ResponseManager.handleError(res, err);
    }
}

export async function handleResetPassword(req: IExpressRequest, res: ExpressResponse): Promise<void> {
    const email = req.email!;
    const deviceId = req.headers['x-device-id'];
    const {password} = req.body;

    try {
        const token = await authService.ResetPassword({
            email,
            deviceId: <string>deviceId,
            password,
        });

        ResponseManager.success(res, {token});
    } catch (err) {
        ResponseManager.handleError(res, err);
    }
}