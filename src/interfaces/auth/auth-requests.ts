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