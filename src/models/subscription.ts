import * as mongoose from 'mongoose';
import {SubscriptionSchedule,SubscriptionStatus,Subscription,PaymentStatus} from "../interfaces";
import { Schema } from 'mongoose';
import { config } from '../constants/settings';
import { v4 as uuidv4 } from 'uuid';



const SubscriptionSchema = new Schema<Subscription>({
    _id: {
        type: String, default: function genUUID() {
            return uuidv4();
        }
    },
    email:{
        type: String,
        required: true,
        lowerCase: true,
        true: true
    },
    fullName:{
        type: String,
        required: true
    },
    user:{
        type:String,
        required: true,
        ref: config.mongodb.collections.users
    },
    schedule:{
        type:String,
        required: true,
        enum: Object.values(SubscriptionSchedule)

    },
    startDate:{
        type: Date,
        required: true,
        default: new Date()
    },
    subscriptionStatus:{
        type: String,
        required:true,
        enum: Object.values(SubscriptionStatus),
        default: SubscriptionStatus.ACTIVE
    },
    paymentStatus:{
        type: String,
        required: true,
        enum: Object.values(PaymentStatus)
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
});

export const SubscriptionDb = mongoose.model(config.mongodb.collections.subscription,SubscriptionSchema)