import {Document} from "mongoose";

export interface User extends Document{
    id:string;
    email:string;
    fullName: string;
    createdAt: string;
    updatedAt: string;

}