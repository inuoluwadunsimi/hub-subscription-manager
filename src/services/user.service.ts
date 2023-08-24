import {ChangePasswordRequest} from "../interfaces/auth/auth-requests";
import {UserAuthDb, UserTokenDb} from "../models";
import {BadRequestError} from "../interfaces";
import bcrypt from "bcrypt";

export async function changePassword(body: ChangePasswordRequest): Promise<void> {
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