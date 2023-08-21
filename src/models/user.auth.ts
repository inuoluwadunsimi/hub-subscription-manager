import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';
import {config} from '../constants/settings';
import {v4 as uuidv4} from 'uuid';
import {UserAuth} from "../interfaces";
import {AuthType} from "../interfaces";


export enum userRole {
    USER = 'user',
    ADMIN = 'admin',
    RIDER = 'rider'
}

const userAuth = new Schema<UserAuth>(
    {
        _id: {
            type: String,
            default: function genUUID() {
                return uuidv4();
            },
        },
        email: {
            type: String,
            required: true,
            lowerCase: true,
            true: true,
        },
        password: {
            type: String,
        },
        user: {
            type: String,
            requiredPaths: true,
            ref: 'users',
        },
        role: {
            type: String,
            enum: Object.values(userRole),
            default: userRole.USER

        },
        type: {
            type: String,
            enum: Object.values(AuthType),
            default: AuthType.EMAIL

        },
        recognisedDevices: [
            {
                type: String,
                required: true,
            },
        ],
    },
    {
        toObject: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                return ret;
            },
        },
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                return ret;
            },
        },
        timestamps: true,
        versionKey: false,
        //
    }
);

export const UserAuthDb = mongoose.model(
    config.mongodb.collections.userAuth,
    userAuth
);
