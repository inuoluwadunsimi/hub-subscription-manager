import {
    ChangePasswordRequest,
    Subscription,
    SubscriptionStatus,
    Attendance,
    ClockDaysRequest,
    ClockInDaysResponse
} from "../interfaces";
import {AttendanceDb, SubscriptionDb, UserAuthDb, UserTokenDb} from "../models";
import {BadRequestError} from "../interfaces";
import bcrypt from "bcrypt";

export async function changePassword(body: ChangePasswordRequest): Promise<void> {
    /**
     * throw error if device is not recognised
     * compare oldPassword inouted to one in db, throw error if not match
     * save new password and generate new token, delete previous token
     */

    const {userId, oldPassword, newPassword, deviceId} = body

    const userAuth = await UserAuthDb.findOne({user: userId})

    if (!userAuth?.recognisedDevices.includes(deviceId)) {
        throw new BadRequestError('Unrecognised devices cannot make password change')

    }

    const isCorrect = await bcrypt.compare(oldPassword, userAuth.password!)
    if (!isCorrect) {
        throw new BadRequestError('Old password is incorrect')
    }

    const newHash = await bcrypt.hash(newPassword, 12)

    await UserAuthDb.updateOne({user: userId}, {
        password: newHash,
    })

    await UserTokenDb.deleteOne({user: userId})

}

export async function clockIn(userId:string):Promise<void>{
    /*check if user has active subscription,
    * check if user has checked in today already, throw error if they have
    * create new attendance record with  date and  clockIntime*/

    const userSub = await SubscriptionDb.findOne<Subscription>({user:userId,subscriptionStatus:SubscriptionStatus.ACTIVE})
    if(!userSub){
        throw new BadRequestError('Inactive subscription')
    }

    const today = new Date()
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);


    const attendance = await AttendanceDb.findOne<Attendance>({user:userId,date:{$gte:startOfDay,$lte:endOfDay}})
    if(attendance){
        throw new BadRequestError('already clocked in')
    }

    await AttendanceDb.create({
        user:userId,
        clockInTime:time
    })


}

export async function clockOut(userId:string):Promise<void>{
    /*fetch attendance record created that day
    * update the record with the current time*/

    const today = new Date()
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const clockOutTime = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();


    await AttendanceDb.updateOne({user:userId,date:{$gte:startOfDay,$lte:endOfDay}},{
        clockOutTime
    })


}

export async function getClockInDays(data:ClockDaysRequest):Promise<ClockInDaysResponse>{
    /*if query of month is included in req, fetch attendance record that matches it
    * run same query if start and end date are included and if no query is included
    * the month is a string index of the month i.e 0-11 with 7 being august
    * */
    const {startDate,userId,endDate,month} = data

    if(month){
        const days = await AttendanceDb.find<Attendance>({user:userId,date:{$gte:new Date(new Date().getFullYear(),+month,1),
            $lt:new Date(new Date().getFullYear(),+month + 1,1)}})
        const noOfDays =  await AttendanceDb.find<Attendance>({user:userId,date:{$gte:new Date(new Date().getFullYear(),+month,1),
                $lt:new Date(new Date().getFullYear(),+month + 1,1)}}).countDocuments()

        return {
            days: days,
            count: noOfDays
        }
    }

    if(startDate && endDate){
        const days = await AttendanceDb.find<Attendance>({user:userId,date:{$gte: new Date(startDate),$lte: new Date(endDate)}})
        const noOfDays = await AttendanceDb.find<Attendance>({user:userId,date:{$gte: new Date(startDate),$lte: new Date(endDate)}}).countDocuments()
        return {
            days: days,
            count: noOfDays
        }

    }

    const days = await  AttendanceDb.find<Attendance>({user:userId})
    const noOfDays = await AttendanceDb.find<Attendance>({user:userId}).countDocuments()
    return{
        days,
        count:noOfDays
    }

}