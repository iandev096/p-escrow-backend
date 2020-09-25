export enum LogAction {
    O_AUTH_SIGN_UP = 'A user signed up with OAUTH',
    SIGN_UP = 'A user has signed up',
    O_AUTH_SIGN_IN = 'A user signed in with OAUTH',
    SIGN_IN = 'A user has signed in',

    CREATE_USER_CONTACT_DETAIL = 'Created user contact detail',
    UPDATED_USER_CONTACT_DETAIL = 'Created user contact detail',
    DELETED_USER_CONTACT_DETAIL = 'Created user contact detail',

    PASSWORD_RESET_TOKEN_SENT = 'Password reset token sent',
    EMAIL_VERIFICATION_TOKEN_SENT = 'Email Verification token sent',
    CONTACT_NUMBER_VERIFICATION_TOKEN_SENT = 'Contact number verification token sent',
    
    PASSWORD_RESET_CAN_COMPLETE = 'Password reset complete',
    EMAIL_VERIFICATION_CAN_COMPLETE = 'Email Verification is complete',
    CONTACT_NUMBER_VERIFICATION_CAN_COMPLETE = 'Contact number verification is complete',

    CREATE_PRODUCT = 'Created product',
    UPDATE_PRODUCT = 'Updated product',
    DELETE_PRODUCT = 'Deleted product(s)',
    LIKE_PRODUCT = 'Like product(s)',
    UNLIKE_PRODUCT = 'Unlike product(s)',
    ADD_CATEGORY = 'Added categories',
    REMOVE_CATEGORY = 'Removed categories',
    ADD_PRODUCT_IMAGE = 'Added product images',
    REMOVE_PRODUCT_IMAGE = 'Removed product images',
    ADD_PRODUCT_TO_CART = 'Add product to cart',
    REMOVE_PRODUCT_FROM_CART = 'Remove product to cart',

    ADD_PRODUCT_TO_FEATURED = 'Add product to featured products',
    REMOVE_PRODUCT_FROM_FEATURED = 'Remove product from featured products',
}