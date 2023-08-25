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