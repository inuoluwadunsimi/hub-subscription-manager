import {Attendance} from "../models/attendance";

export interface ClockInDaysResponse{
    days: Attendance[]
    count: number;
}