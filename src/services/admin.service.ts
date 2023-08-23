import {UserAuthDb, UserDb, UserTokenDb} from "../models";
import {BadRequestError, JwtType, NotFoundError, UnAuthorizedError, User} from "../interfaces";
import {config} from "../constants/settings";
import {verifyGoogleToken} from "../helpers/google.helper";
import {JwtHelper} from "../helpers/jwt/jwt.helper";
import {redisClient} from "../helpers/redis.connector";
import {AdmingGoogleLogin} from "../interfaces/admin/admin-requests";
import {Mailer} from "../mailing/mail.service";

const jwtHelper = new JwtHelper({
    privateKey: config.jwtPrivateKey,
    UserTokenDb,
    redisClient: redisClient
})
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

export async function adminGoogleSignin(body:AdmingGoogleLogin):Promise<string>{
    const {googleToken,deviceId} = body
    const {email:googleEmail} = await verifyGoogleToken(googleToken)

    if(googleEmail !== config.admin.email){
        throw new UnAuthorizedError('admin access required')
    }
    const adminUser = await UserDb.findOne<User>({email:config.admin.email})
    if(!adminUser){
        throw new NotFoundError('admin user not found')
    }

    const token = jwtHelper.generateToken({
        email:googleEmail,
        userId: adminUser.id,
        type: JwtType.ADMIN_USER,
        deviceId
    })

    await UserTokenDb.updateOne({email:googleEmail},{
        token,
        email:googleEmail,
        user:adminUser.id,
        deviceId: deviceId,

    })
    console.log(token)

    return token



}

export async function addUser(email:string):Promise<void>{
    const exUser = await UserDb.findOne<User>({email})
    if(exUser){
        throw new  BadRequestError('subscriber aleady exists')
    }

  await UserDb.create({email})

    await Mailer.sendSignupMail(email)


}



