import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { config } from '../constants/settings';
import { v4 as uuidv4 } from 'uuid';
import {User} from "../interfaces";

const UserSchema = new Schema<User>({
    _id: {
        type: String, default: function genUUID() {
            return uuidv4();
        }
    },
    email: {
        type: String,
        required: true,
        lowerCase: true,
        unique:true,
        true: true
    },
    fullName: {
        type: String,
        // required: true
    },
}, {
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
});

export const  UserDb = mongoose.model(config.mongodb.collections.users, UserSchema);
