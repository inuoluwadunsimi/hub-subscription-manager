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