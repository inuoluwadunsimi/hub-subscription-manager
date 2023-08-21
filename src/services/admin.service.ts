import {UserDb} from "../models";
import {User} from "../interfaces";
import {config} from "../constants/settings";

export async function createAdminUser(){
    try{
        const adminCreated = await UserDb.findOne<User>({email:config.admin.email})
        if(!adminCreated){
            await UserDb.create({
                email: config.admin.email,
                fullName: config.admin.fullName

            })
        }
    }catch (err){
        console.error(err)
        throw {
            code: 500,
            data: err
        }
    }

}