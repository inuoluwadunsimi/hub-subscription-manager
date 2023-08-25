import {Document} from 'mongoose';

export interface UserVerification extends Document {
    id: string;
    email: string;
    otp: string;
    deviceId: string;
    type: OtpType;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

export enum OtpType {
    SIGN_UP = 'SIGNUP',
    LOGIN = 'LOGIN',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

export enum JwtType {
    NEW_USER = 'NEW_USER',
    USER = 'USER',
    ADMIN_USER = 'ADMIN_USER',
}



