import {UserAuthDb, UserDb, userRole, UserTokenDb, UserVerDb} from "../models";
import {
    AuthType,
    BadRequestError,
    JwtType,
    OtpType,
    UnAuthorizedError,
    User,
    UserAuth,
    UserVerification
} from "../interfaces";
import {JwtHelper} from "../helpers/jwt/jwt.helper";
import {redisClient} from "../helpers/redis.connector";
import {config} from "../constants/settings";
import {LoginRequest, SignupWithEmail, UserGoogleAuth, VeifyDeviceRequest,ForgotPasswordOtpRequest,ForgotPasswordOtpVerifyRequest,ResetPasswordRequest} from "../interfaces/auth/auth-requests";
import {AuthResponse} from "../interfaces/auth/auth.responses";
import {verifyGoogleToken} from "../helpers/google.helper";
import bcrypt from 'bcrypt'
import {Mailer} from "../mailing/mail.service";
import {generateOtp} from "../helpers/utils";


const jwtHelper = new JwtHelper({
    privateKey: config.jwtPrivateKey,
    UserTokenDb,
    redisClient: redisClient
})

export async function userGoogleAuth(data:UserGoogleAuth):Promise<AuthResponse>{
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
   await UserDb.updateOne<User>({email:googleEmail},{
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

    await Mailer.sendWelcomeMail(googleEmail)

    return {
        token: accessToken,
        user: user as unknown as User,
    };

}


// there is no need for email verification with otp since signup link is sent directly to their mails
export async function emailSignup(data:SignupWithEmail):Promise<AuthResponse>{
    const {email,deviceId,password,fullName} = data

    // check if the user has been added by the admin, throw an error if not
    const user = await UserDb.findOne<User>({email})
    if(!user){
        throw new UnAuthorizedError('unauthorised signup')
    }


    // update the user record with the user's name
    await UserDb.updateOne({email},{
        fullName
    })
    const hashedPassword = await bcrypt.hash(password,12)
     await UserAuthDb.create({
        email,
        password:hashedPassword,
        user:user.id,
        recognisedDevices: deviceId,
    })


    // generate a user jwt
    const accessToken = jwtHelper.generateToken({
        email,
        deviceId,
        type:JwtType.USER,
        userId: user.id
    })


    //save jwt to db
    await UserTokenDb.create({
        email,
        token:accessToken,
        user:user.id,
        deviceId
    })


    // send a welcome mail to the user
    await Mailer.sendWelcomeMail(email)


    return {
        token: accessToken,
        user: user
    }


}

export async function Login(data:LoginRequest):Promise<AuthResponse>{
    /* compare the inputed password, throw error if they are not equal
    if the device is not registered, throw an error and send a verification otp
    issue a token if recognised and save to db
    * */
    const {password,deviceId} = data
    let {email} = data
    email = email.toLowerCase()

    // check if the user record exists
    const user = await UserAuthDb.findOne<UserAuth>({email})
    if(!user){
        throw new BadRequestError('email not registered')
    }

    const verifyPassword = await bcrypt.compare(password,user.password);
    if(!verifyPassword){
        throw new BadRequestError('Incorrect password')
    }

    // check if device is recognised
    if(!user.recognisedDevices.includes(deviceId)){
        // generate otp
        const otp = generateOtp()
        await UserVerDb.create({
            email,
            otp,
            deviceId,
            type:OtpType.LOGIN
        })

        await Mailer.sendVerifyDeviceOtp(email, otp)

        throw new BadRequestError(
            'This device is unrecognised, an otp has been sent to your mail to verify the account'
        );

    };

    const accessToken = jwtHelper.generateToken({
        email,
        userId:user.user,
        type: JwtType.USER,
        deviceId
    })


    await UserTokenDb.updateOne(
        {email},
        {
            token: accessToken,
            email,
            user: user.user,
            deviceId,
        },
        {upsert: true}
    );

    const userDets = await UserDb.findOne<User>({email});

    return {
        token: accessToken,
        user: userDets!,
    };

}

export async function verifyDevice(data:VeifyDeviceRequest):Promise<AuthResponse>{
    /** check if if the otp issues is correct and has not expired
     * trustDevice? true: recognise the device
     * generate a token and save it to db,
     * delete the verification record so it cannot be reused
     *
     */

    const {otp,deviceId,trustDevice} = data
    let {email} = data
    email = email.toLowerCase()

    const existingVer = await UserVerDb.findOne<UserVerification>({email, otp, type: OtpType.LOGIN})
    if (!existingVer) {
        throw new BadRequestError('Otp is incorrect')
    }

    const existingUserAuth = await UserAuthDb.findOne<UserAuth>({email})
    if (!existingUserAuth) {
        throw new BadRequestError('User not found')
    }

    // if the device used is trusted, add it's deviceId to the db
    if (trustDevice) {
        existingUserAuth?.recognisedDevices.push(deviceId)
    }

    const accessToken = jwtHelper.generateToken({
        email,
        deviceId,
        type: JwtType.USER,
        userId: existingUserAuth?.user
    })

    await UserTokenDb.updateOne({email, user: existingUserAuth.user}, {
        email,
        token: accessToken,
        user: existingUserAuth?.user,
        deviceId
    }, {upsert: true})

    const user = await UserDb.findById<User>(existingUserAuth.user)
    await existingVer.deleteOne();
    return {
        token: accessToken,
        user: user!
    }

}

export async function sendForgotPasswordOtp(body: ForgotPasswordOtpRequest): Promise<void> {
    /* generate and send otp if user exists
    * if an otp has been sent within one minute,throw error
    * save the otp to the db*/
    let {email} = body;
    const {deviceId} = body;
    email = email.toLowerCase();

    const existingAuth = await UserDb.findOne({email});
    if (!existingAuth) {
        throw new BadRequestError('user with this email does not exist');
    }

    // generate otp


    const existingVerification = await UserVerDb.findOne({
        email,
        deviceId,
        createdAt: {$gte: Date.now() - 60000},
    });

    if (existingVerification) {
        throw new BadRequestError('OTP has been sent within the minute.');
    }

    const otp = generateOtp();


    const newVer = new UserVerDb({
        email,
        otp,
        deviceId,
        type: OtpType.FORGOT_PASSWORD,
    });


    await newVer.save();
    await Mailer.sendForgotPasswordOtp(email, otp)

    // send an email containing the otp
}



export async function verifyForgotPasswordOtpRequest(body: ForgotPasswordOtpVerifyRequest): Promise<String> {
    /* query userVerDb with otp,mail,deviceId, and type
    * throw error if no record is found, issue shortlived token
    * if record is found and has not expired
    * delete userverifcation record*/

    let {email} = body;
    email = email.toLowerCase();
    const {otp, deviceId} = body;

    const verDb = await UserVerDb.findOne({
        email,
        otp,
        type: OtpType.FORGOT_PASSWORD,
        deviceId,
    });

    if (!verDb) {
        throw new BadRequestError('Otp is invalid');
    } else if (new Date(verDb.expiresAt) > new Date()) {
        throw new BadRequestError('OTP has expired');
    }

    const token = jwtHelper.generateToken({
        email,
        deviceId,
        type: JwtType.NEW_USER,
    });

    verDb.deleteOne();

    return token;
}


export async function ResetPassword(body: ResetPasswordRequest): Promise<AuthResponse> {
    /* extract email from token, hash the iinputed password
    * update the db with the hashed password
    * return the token and user object*/
    let {email} = body;
    email = email.toLowerCase();
    const {deviceId, password} = body;

    const exUser = await UserAuthDb.findOne({
        email,
    });

    if (!exUser) {
        throw new BadRequestError('user does not exist');
    }


    exUser.password = await bcrypt.hash(password, 12);
    await exUser.save();
    const token = jwtHelper.generateToken({
        email,
        deviceId,
        type: JwtType.USER,
    });
    const user = await UserDb.findOne<User>({email})


    await UserTokenDb.deleteMany({})
    await UserTokenDb.create({
        token,
        email,
        user: user?.id,
        deviceId
    })

    return {
        token: token,
        user:user!
    };
}

