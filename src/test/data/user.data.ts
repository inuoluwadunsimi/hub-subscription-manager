import {faker} from "@faker-js/faker";

export const userData ={
    id:faker.string.uuid(),
    email: faker.internet.email(),
    fullName:faker.internet.displayName(),
    otp: faker.string.numeric(6),
    signUpAuthToken: faker.string.alphanumeric(32),
    authToken: faker.string.alphanumeric(32),
    forgotPasswordAuthToken:faker.string.alphanumeric(32),
    deviceId: faker.string.uuid(),
    password:'ourOldPassword',
    newPassword:'Ajibola123@@@@',
    googleToken:faker.string.uuid(),
    loginToken:faker.string.uuid()

}


export const mockAttendance ={
    days:[],
    count:0
}


export const staticUserAuthData = {
    email: 'francis@gmail.com',
    fullName: 'fenyl alanyl'
};