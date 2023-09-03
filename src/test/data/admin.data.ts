import { faker } from '@faker-js/faker';

export const adminData = {
    email:'danielolaoladeinde@gmail.com',
    fullName:'Opolo Innovation global'
}

export const adminsData ={
    email:'danielolaoladeinde@gmail.com',
    fullName:'Opolo Innovation global',
    otp: '12345',
    signUpAuthToken: faker.string.alphanumeric(32),
    authToken: faker.string.alphanumeric(32),
    forgotPasswordAuthToken:faker.string.alphanumeric(32),
    deviceId: faker.string.uuid(),

}