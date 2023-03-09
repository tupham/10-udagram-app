import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'

import {verify} from 'jsonwebtoken';
import {JwtToken} from '../../auth/JwtToken';
import * as AWS from 'aws-sdk';

const secretId = process.env.AUTH_0_SECRET_ID;
const secretField = process.env.AUTH_0_SECRET_FIELD;

const client = new AWS.SecretsManager();

let cachedSecret: string;

export const handler = async(event: CustomAuthorizerEvent, context) : Promise<CustomAuthorizerResult>=>{
    console.log('Authorize event: ', event);
    console.log('Authorize context: ', context);
    console.log('secretId:', secretId);
    console.log('secretField:', secretField);
    try {

        const decodedToken = await verifyToken(event.authorizationToken);
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
}

async function verifyToken(authHeader: string): Promise<JwtToken> {
    if (!authHeader)
      throw new Error('No authentication header')
  
    if (!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header')
  
    const split = authHeader.split(' ');
    const token = split[1];
    console.log('token: ', token);
    const secretObject: any = await getSecret();
    const secret = secretObject[1];
    console.log('secret: ', secret);
    return verify(token, secret) as JwtToken;
  }
  
  async function getSecret(){
    console.log('getSecret');
    if(cachedSecret) return cachedSecret;
    const data = await client.getSecretValue({
      SecretId: secretId
    }).promise();
    console.log('data: ', data);
    cachedSecret = data.SecretString;
    var keyValue = cachedSecret.split('=');    
    return keyValue;
  }
