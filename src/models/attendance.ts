import * as mongoose from "mongoose";
import { Schema } from 'mongoose';
import { config } from '../constants/settings';
import { v4 as uuidv4 } from 'uuid';
import {Attendance} from "../interfaces";

const AttendanceSchema = new Schema<Attendance>({
    _id: {
        type: String, default: function genUUID() {
            return uuidv4();
        }
    },
    user:{
        type:String,
        required: true,
        ref: config.mongodb.collections.users
    },
    date:{
        type:Date,
        required: true,
        default: new Date()

    },
    clockInTime:{
        type: String,
        required:true,
    },
    clockOutTime:{
        type:String,
        // required:true,
    }
},{
    toObject: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        }
    },
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            return ret;
        }
    },
    timestamps: true, versionKey: false
})

export const AttendanceDb = mongoose.model(config.mongodb.collections.attendance,AttendanceSchema)