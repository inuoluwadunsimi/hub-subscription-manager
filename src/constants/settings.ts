// This is where i set config for mongodb etc

import * as dotenv from 'dotenv'
dotenv.config()




export const config = {
    jwtPrivateKey: <string>process.env.JWT_PRIVATE_KEY,
    mongodb: {
      uri: <string>process.env.MONGODB_URI,
      collections: {
          users:'users',
          userAuthTokens: 'user_auth_tokens',
          userVerifications: 'user_verifications',
          userAuth: 'user_auths',
          subscription: 'subscription',
          attendance:'attendance',
      }
    },
    google: {
      clientID: <string>process.env.GOOGLE_CLIENT_ID,
    },
    redis: {
      uri: <string>process.env.REDIS_URI
    },
    admin:{
        email:'danielolaoladeinde@gmail.com',
        fullName: 'Opolo Innovation global',

    },
    mailing: {
        gmail_pass: <string>process.env["GMAIL_PASS"]
    },
  };
  