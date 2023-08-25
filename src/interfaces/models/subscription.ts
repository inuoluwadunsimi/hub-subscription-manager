import {Document} from "mongoose";

export interface Subscription extends Document{
    id: string;
    email: string;
    fullName: string;
    user: string;
    schedule: string;
    startDate: Date;
    subscriptionStatus: string;
    paymentStatus: string;
    createdAt:string;
    updatedAt:string;
}

export enum SubscriptionSchedule{
    MONTHLY ='monthly',
    WEEKLY = 'weekly',
    DAILY = 'daily'
}

export enum PaymentStatus{
    PAID = 'paid',
    OWING = 'owing'
}

export enum SubscriptionStatus{
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    STOPPED = 'stopped'
}