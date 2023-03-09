import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register';
import * as middy from 'middy'
import { secretsManager } from 'middy/middlewares'
import {verify} from 'jsonwebtoken';
import {JwtToken} from '../../auth/JwtToken';

const secretId = process.env.AUTH_0_SECRET_ID;
const secretField = process.env.AUTH_0_SECRET_FIELD;


export const handler = middy(async(event: CustomAuthorizerEvent, context) : Promise<CustomAuthorizerResult>=>{
    console.log('Authorize event: ', event);
    console.log('Authorize context: ', context);
    console.log('secretId:', secretId);
    console.log('secretField:', secretField);
    try {

        const decodedToken = verifyToken(event.authorizationToken, context.AUTH0_SECRET[secretField]);
        console.log('User was authorized');
        var objectReturn = {
          principalId: decodedToken.sub,
          policyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Action: 'execute-api:Invoke',
                Effect: 'Allow',
                Resource: '*'
              }
            ]
          }
        };
        console.log('objectReturn: ', objectReturn);
        return objectReturn;
    }catch(e){
        console.log(e);
    }
});

function verifyToken(authHeader: string, secret: string): JwtToken{
    if (!authHeader)
      throw new Error('No authentication header')
  
    if (!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header')
  
    const split = authHeader.split(' ');
    const token = split[1];
    console.log('token: ', token);
    console.log('secret: ', secret);
    return verify(token, secret) as JwtToken;
  }
  
handler.use(
  secretsManager({
    cache: true,
    cacheExpiryInMillis: 60000,
    throwOnFailedCall: true,secrets:{
      AUTH0_SECRET: secretId
    }
  })
);