
import {User} from "../models/user";

export interface AuthResponse {
    token: string;
    user: User;
}

