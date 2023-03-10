import {decode} from 'jsonwebtoken';
import {JwtToken} from './JwtToken';

export function getUserId(jwtToken: string): string{
    console.log('getUserId: ', jwtToken);
    var decodeObject = decode(jwtToken) as JwtToken;
    console.log('getUserId; ', decodeObject);
    return decodeObject.sub;
}