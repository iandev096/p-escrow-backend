import { User } from "./entities/user.entity";

export interface SendTokenFn {
    (user: User): Promise<any>
}