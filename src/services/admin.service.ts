import {UserAuthDb, SubscriptionDb,UserDb, UserTokenDb} from "../models";
import {
    BadRequestError,
    CreateSubscriptionRequest,
    JwtType,
    NotFoundError,
    UnAuthorizedError,
    User,
    AdmingGoogleLogin, ChangePaymentStatusRequest, Subscription, ChangeSubscriptionStatusRequest
} from "../interfaces";
import {config} from "../constants/settings";
import {verifyGoogleToken} from "../helpers/google.helper";
import {JwtHelper} from "../helpers/jwt/jwt.helper";
import {redisClient} from "../helpers/redis.connector";
import {Mailer} from "../mailing/mail.service";

const jwtHelper = new JwtHelper({
    privateKey: config.jwtPrivateKey,
    UserTokenDb,
    redisClient: redisClient
})
export async function createAdminUser(){
    /* this runs on server start to create an admin
    * if the admin alredy exists, the server keeps running
    * */
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
    /* extract the email attched to the
    * google token and compare it to the
    * hardcode admin email, issue a token only
    * if they are equal */
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
        type:JwtType.ADMIN_USER,
        deviceId
    })

    await UserTokenDb.updateOne({email:googleEmail},{
        token,
        email:googleEmail,
        user:adminUser.id,
        deviceId: deviceId,

    },{upsert:true})
    console.log(token)

    return token



}

export async function addUser(email:string):Promise<void>{
    /* create a user with the subscriber's mail,
    * send a mail with registration link to continue signup,
    * throw an error if the mail already exists */
    const exUser = await UserDb.findOne<User>({email})
    if(exUser){
        throw new  BadRequestError('subscriber aleady exists')
    }

  await UserDb.create({email})

    await Mailer.sendSignupMail(email)


}

export async function getUsers():Promise<User[]>{

    const users = await UserDb.find<User>({})
    return users

}

export async function createSubscription(data:CreateSubscriptionRequest):Promise<void>{
    const {email,schedule,paymentStatus,startDate,subscriptionStatus} = data

    const user = await UserDb.findOne<User>({email})
    if(!user){
        throw new NotFoundError('user has not been created')
    }

    if(!startDate){
        await SubscriptionDb.create({
            email,
            fullName:user.fullName,
            user:user.id,
            schedule,
            subscriptionStatus,
            paymentStatus
        })
        return
    }

    await SubscriptionDb.create({
        email,
        fullName:user.fullName,
        user:user.id,
        schedule,
        startDate,
        subscriptionStatus,
        paymentStatus
    })

}


export async function changePaymentStatus(data:ChangePaymentStatusRequest):Promise<void>{
    const {userId,paymentStatus} = data
    const userSub = await SubscriptionDb.findOne<Subscription>({user:userId})
    if(!userSub){
        throw new NotFoundError('no subscription record for this user')
    }

    userSub.paymentStatus = paymentStatus
    await userSub.save()
}


export async function changeSubscriptionStatus(data:ChangeSubscriptionStatusRequest):Promise<void>{
    const {userId,subscriptionStatus} = data
    const userSub = await SubscriptionDb.findOne<Subscription>({user:userId})
    if(!userSub){
        throw new NotFoundError('no subscription record for this user')
    }

    userSub.subscriptionStatus = subscriptionStatus
    await userSub.save()
}
