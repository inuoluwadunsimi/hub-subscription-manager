
import {User} from "../models/user";

export interface SignUpResponse {
    token: string;
    user: User;
}