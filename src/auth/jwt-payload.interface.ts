import { Provider } from "./auth.service";

export interface JwtPayload {
    fullName?: string;
    userId?: string;
    email?: string;
    provider?: Provider,
    verification?: { emailVerified: boolean, contactNumberVerified: boolean}
}