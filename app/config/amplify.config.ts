// AWS Amplify configuration for web
const config = {
  s3: {
    REGION: "ap-southeast-1",
    BUCKET: "YOUR_S3_UPLOADS_BUCKET_NAME",
  },
  apiGateway: {
    REGION: "ap-southeast-1",
    URL: "https://api.finexisam.com",
  },
  cognito: {
    REGION: "ap-southeast-1",
    USER_POOL_ID: "ap-southeast-1_LgVHkfar5",
    APP_CLIENT_ID: "phv0ju4h43eb40ggqt244ek",
    IDENTITY_POOL_ID: "ap-southeast-1:aaaf2001-c87a-4056-94a7-f9f2388d6ce5",
    OAUTH_DOMAIN: "auth.finexisam.com",
  },
};

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: config.cognito.USER_POOL_ID,
      userPoolClientId: config.cognito.APP_CLIENT_ID,
      identityPoolId: config.cognito.IDENTITY_POOL_ID,
      loginWith: {
        oauth: {
          domain: config.cognito.OAUTH_DOMAIN,
          scopes: ["aws.cognito.signin.user.admin", "email", "phone", "profile", "openid"],
          redirectSignIn: [typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : ""],
          redirectSignOut: [typeof window !== "undefined" ? `${window.location.origin}/` : ""],
          responseType: "code" as const,
        },
      },
    },
  },
  API: {
    REST: {
      "fam-service": {
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION,
      },
    },
  },
};

export default amplifyConfig;
