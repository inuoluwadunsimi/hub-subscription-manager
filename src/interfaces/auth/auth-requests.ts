export interface UserGoogleAuth{
    email: string;
    deviceId: string;
    googleToken: string;

}

export interface SignupWithEmail{
    email:string;
    deviceId:string;
    fullName:string;
    password:string;
}

export interface LoginRequest{
    email:string;
    deviceId:string;
    password:string;
}

export interface VeifyDeviceRequest{
    email:string;
    deviceId:string;
    otp:string;
    trustDevice:boolean;
}

export interface ChangePasswordRequest {
    deviceId: string;
    oldPassword: string;
    newPassword: string;
    userId: string;

}

export interface ForgotPasswordOtpRequest {
    email: string;
    deviceId: string;
}

export interface ForgotPasswordOtpVerifyRequest {
    email: string;
    deviceId: string;
    otp: string;
}

export interface ResetPasswordRequest {
    email: string;
    deviceId: string;
    password: string;
}
