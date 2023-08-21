import {Document} from "mongoose";

export interface UserAuth extends Document{
    id: string;
    email: string;
    password: string;
    user: string;
    role: string;
    type: string;
    recognisedDevices: string[];
    createdAt: string;
    updatedAt: string;
}

export enum AuthType {
    EMAIL = 'email',
    GOOGLE = 'google',
}