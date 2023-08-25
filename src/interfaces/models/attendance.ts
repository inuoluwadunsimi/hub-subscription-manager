import {Document} from "mongoose";

export interface Attendance extends Document{
    id:string;
    user:string;
    date:Date;
    clockInTime:string;
    clockOutTime:string;
    createdAt:string;
    updatedAt:string;
}