import * as bcrypt from 'bcryptjs';

export const hashPassword = (password: string, salt: string): Promise<string> => {
    return bcrypt.hash(password, salt);
}

export const generateExpDate = (hoursToAdd: number) => {
    const time = new Date();
    time.setTime(time.getTime() + (hoursToAdd * 60 * 60 * 1024));
    return time;
}