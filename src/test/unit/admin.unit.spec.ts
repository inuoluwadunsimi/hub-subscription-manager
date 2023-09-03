///<reference path="../../../node_modules/@types/jest/index.d.ts"/>


import {UserDb} from "../../models";
import {adminData} from "../data/admin.data";
import {createAdminUser} from "../../services";

jest.mock("../../models/user")


describe('admin creation',()=>{
    beforeAll( ()=>{
        UserDb.findOne = jest.fn().mockClear()
        UserDb.create = jest.fn().mockClear()
    })


    it('should not create admin if it exists', async ()=>{

        UserDb.findOne = jest.fn().mockResolvedValue({})
        await createAdminUser()
        expect(UserDb.findOne).toHaveBeenCalledWith({email:adminData.email})
        expect(UserDb.create).not.toHaveBeenCalled()
    })


    it('should create admin account',async ()=>{
        UserDb.findOne = jest.fn().mockResolvedValue(null)
        UserDb.create = jest.fn().mockResolvedValue(adminData)
        await createAdminUser()
        expect(UserDb.findOne).toHaveBeenCalledWith({email:adminData.email})
        expect(UserDb.create).toHaveBeenCalledWith(adminData)

    })


})