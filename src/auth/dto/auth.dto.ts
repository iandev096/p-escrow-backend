import { IsString, MinLength, Matches, IsEmail, IsOptional, IsUUID } from "class-validator";

export class AuthCredentialDto {

    @IsString()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone: string;
    
    @IsString()
    @IsOptional()
    fullName: string;

    @IsString()
    @MinLength(8)
    // @Matches(
    //     /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
    //     { message: 'Password too weak' }
    // ) 
    // (?=.*[a-z])	The string must contain at least 1 lowercase alphabetical character
    // (?=.*[A-Z])	The string must contain at least 1 uppercase alphabetical character
    // (?=.*[0-9])	The string must contain at least 1 numeric character
    // (?=.*[!@#$%^&*])	The string must contain at least one special character, but we are escaping reserved RegEx characters to avoid conflict
    // (?=.{8,})	The string must be eight characters or longer
    password: string;
}

export class EmailDto {
    @IsString()
    @IsEmail()
    email: string;
}

export class UserIdDto {
    @IsString()
    userId: string;
}

export class VerifyTokenDto {
    @IsString()
    @IsEmail()
    email: string;
    
    @IsString()
    @IsUUID()
    token: string;
}

export class PasswordDto {
    @IsString()
    @IsOptional()
    @MinLength(8)
    @Matches(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
        { message: 'Password too weak' }
    ) 
    // (?=.*[a-z])	The string must contain at least 1 lowercase alphabetical character
    // (?=.*[A-Z])	The string must contain at least 1 uppercase alphabetical character
    // (?=.*[0-9])	The string must contain at least 1 numeric character
    // (?=.*[!@#$%^&*])	The string must contain at least one special character, but we are escaping reserved RegEx characters to avoid conflict
    // (?=.{8,})	The string must be eight characters or longer
    password: string;

}