
export const enumToArray = (en: any) => {
    const arr = [];
    for (const value in en) {
        arr.push(en[value]);
    }
    return arr;
}

export const customDecodeUriComponents = (path: string, jwt: string) => {
    if (path.trim() === '') return '';
    const decoded = decodeURIComponent(path);
    if (decoded.includes('?')) {
        return decoded.replace('?', `?jwt=${jwt}&`);
    } else {
        return decoded;
    }
}