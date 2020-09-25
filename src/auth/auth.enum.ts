
export enum ErrorMessage {
    ACCOUNT_NOT_VERIFIED = 'AccountNotVerified',
    EMAIL_VERIFICATION_FAILED = 'AccountVerificationFailed',
    CONTACT_NUMBER_VERIFICATION_FAILED = 'ContactNumberVerificationFailed',
    PASSWORD_VERIFICATION_FAILED = 'PasswordVerificationFailed'
}

export enum TokenVerificationType {
    EMAIL = 'email',
    CONTACT_NUMBER = 'contactNumber',
    PASSWORD = 'password'
}