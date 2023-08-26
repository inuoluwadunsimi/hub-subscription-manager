export interface AdmingGoogleLogin{
    googleToken: string;
    deviceId: string;
}

export interface CreateSubscriptionRequest{
    email:string;
    schedule:string;
    paymentStatus:string;
    startDate:string;
    subscriptionStatus:string;
}

export interface ChangePaymentStatusRequest{
    userId:string;
    paymentStatus:string;
}

export interface ChangeSubscriptionStatusRequest{
    userId:string;
    subscriptionStatus:string;
}

export interface EditClockInRequest{
    userId:string;
    date:string;
    clockInTime:string;
    clockOutTime:string;
}