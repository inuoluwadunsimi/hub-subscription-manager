import {UserAuthDb, UserDb, userRole, UserTokenDb} from "../models";
import {AuthType, BadRequestError, JwtType, UnAuthorizedError, User, UserAuth} from "../interfaces";
import {JwtHelper} from "../helpers/jwt/jwt.helper";
import {redisClient} from "../helpers/redis.connector";
import {config} from "../constants/settings";
import {UserGoogleAuth} from "../interfaces/auth/auth-requests";
import {SignUpResponse} from "../interfaces/auth/auth.responses";
import {verifyGoogleToken} from "../helpers/google.helper";


const jwtHelper = new JwtHelper({
    privateKey: config.jwtPrivateKey,
    UserTokenDb,
    redisClient: redisClient
})

export async function userGoogleAuth(data:UserGoogleAuth):Promise<SignUpResponse>{
    const {email,deviceId,googleToken} = data


    // check if the user has been created by the admin to avoid unauthorised sighups
    const user = await UserDb.findOne<User>({email})
    if(!user){
        throw new UnAuthorizedError('unauthorised signup attempt')
    }


    // check if the user has completed a previous signup
    const existingUserAuth = await UserAuthDb.findOne<UserAuth>({email})

    // if the user is already signup up, log them in instead
    if (existingUserAuth && existingUserAuth.type === AuthType.EMAIL) {
        throw new BadRequestError('Already signed up with email, login instead')
    }

    if(existingUserAuth){
        if (!existingUserAuth.recognisedDevices.includes(deviceId)) {
            existingUserAuth.recognisedDevices.push(deviceId);
            await existingUserAuth.save();
        }
        const accessToken = jwtHelper.generateToken({
            email,
            deviceId,
            type:JwtType.USER,
            userId:existingUserAuth.user
        });
        return{
            token:accessToken,
            user: user as unknown as User,
        };
    }

    // sign the user up if they are yet to sign up
   const {email:googleEmail,name} = await verifyGoogleToken(googleToken);
    if (email.toLowerCase() !== googleEmail?.toLowerCase()) {
        throw new BadRequestError('Email does not match google account')
    }


    // update the userDetails with the details extracted from the auth token
    const savedUser = await UserDb.updateOne<User>({email:googleEmail},{
        fullName:name
    })

    const newUserAuth = await UserAuthDb.create({
        email:googleEmail,
        type:AuthType.GOOGLE,
        role:userRole.USER,
        user:user.id,
        recognisedDevices: [deviceId],
    })

    const accessToken = jwtHelper.generateToken({
        email:googleEmail,
        deviceId,
        type: JwtType.USER,
        userId: newUserAuth.user,
    });

    await UserTokenDb.create({
        email,
        token: accessToken,
        user: newUserAuth.user,
        deviceId,
    });

    return {
        token: accessToken,
        user: savedUser as unknown as User,
    };





}