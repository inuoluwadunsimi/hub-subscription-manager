import * as mongoose from 'mongoose';
import {OtpType} from '../interfaces';
import {Schema} from 'mongoose';
import {config} from '../constants/settings';
import {v4 as uuidv4} from 'uuid';

const userVerSchema = new Schema(
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
        otp: {
            type: String,
            required: true,
        },
        deviceId: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(OtpType),
            required: true,
        },
        expiresAt: {
            type: Date,
            default: Date.now(),
            index: {expires: '10m'},
        },
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
    }
);

export const UserVerDb = mongoose.model(
    config.mongodb.collections.userVerifications,
    userVerSchema
);
