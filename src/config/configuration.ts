
export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    host: process.env.HOST,
    feUrl: process.env.FE_URL,

    database: {
        host: 'ec2-52-200-48-116.compute-1.amazonaws.com',
        port: '5432',
        password: 'ae2b5178edcd2552fc44ba197abf06800f6b75596314793da5cea0758d990104',
        username: 'dflk2h7d4n0up0',
        name: 'colcxbxtskhpdo'
    },

    oauth: {
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiration: process.env.JWT_EXP
    },
    
    sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY
    },

    cloudinary: {
        url: process.env.CLOUDINARY_URL,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    },

    stage: process.env.STAGE
})