import {IExpressRequest, UserType} from "../interfaces";
import {Response as ExpressResponse} from 'express';
import * as ResponseManager from '../helpers/response.manager'
import * as adminService from '../services/admin.service'

export async function handleAddUser(req:IExpressRequest,res:ExpressResponse):Promise<void>{
    const {email} = req.body
    try{

        await adminService.addUser(email)
        ResponseManager.success(res,{message:'signup mail sent to user'})


    }catch (err){
        ResponseManager.handleError(res,err)

    }



}

export async function handleGetUsers(req:IExpressRequest,res:ExpressResponse):Promise<void>{
    try{

        const users = await adminService.getUsers()
        ResponseManager.success(res,{users})

    }catch (err:any){
        ResponseManager.handleError(res,err)

    }
}

export async function handleCreateSubscription(req:IExpressRequest,res:ExpressResponse):Promise<void>{
    try{
        const {email,schedule,paymentStatus,startDate,subscriptionStatus} = req.body

        await adminService.createSubscription({email,schedule,paymentStatus,startDate,subscriptionStatus})

        ResponseManager.success(res,{message:"subscription successfully created"})
    }catch (err:any){
        ResponseManager.handleError(res,err)
    }
}