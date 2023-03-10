import { CustomAuthorizerResult, CustomAuthorizerEvent } from "aws-lambda";
import { verify } from 'jsonwebtoken';
import { JwtToken } from '../../auth/JwtToken';
import 'source-map-support/register';

const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJaLpdJM4n5KB/MA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi0zeHVxcTNvODUyem0wbjNyLnVzLmF1dGgwLmNvbTAeFw0yMzAzMDkw
NDM4MThaFw0zNjExMTUwNDM4MThaMCwxKjAoBgNVBAMTIWRldi0zeHVxcTNvODUy
em0wbjNyLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAOqI9T0DZ61+3/0Rnke2pdaCpqf8g5oL+tTfq7KgB787D8V3n6suu1eb/d3z
tLQhz+lYXmB7rfCbTioLUqMfEy9w23rIMxaCZFFNvV/mUh/nKd2x/F33yMKkUqcx
mQrrkA6nDX0KL3EQcDNJQjwjsivzDfTJQDcnamg3dW+L7OckLN6amg2BGDcZDree
kAi2MNlo+GNmt0CUzRPuyvNK39svgGqag1UfcKLGhIhpZSZ9gxuym7UgoBmU9zqv
c6mP6aXpeLxwh66Dp3NHr+MbiupqUd1XuIt93TWn2y6v7D5o4OkoVx3XB5W7GBu5
yhKo4SSqnG4TWQ8WLErqqTONotECAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUINMH8LAzJTLpjVFI69rqwD5xSHYwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQAPtdPsEK8+/hpy5NgEPtIWxms2QXOZSw1xFiqu1qBY
KI9az5NEhrxPDCufII/0mVmSsKdeSxcZB701PUH0p2nJjysI7s3fN9emjOiQT4Le
IOmsBCY2h7FkaFZIEpVN4q1N8zTvXV73G2BGVxHnBjQanxGYRiawtOYZsM031PKK
4zTrlKtS1F8IYsMck08DCtcq+1oQ2SUFWvn7UfXuk4TOU4TDulaepIEMn6sDQ/il
Hf5F8JstFjPw3lRCWrhjvpRx4u8nklzT1SiB0W9lo9xj+L4Gn7rzrIVIpWAly7jm
rxEvhrNkNt/WxcmSKqhLGxnqaf3YE9y2g9WCajgcRGz4
-----END CERTIFICATE-----`;
export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    try {
        const jwtToken = verifyToken(event.authorizationToken);
        console.log('User was authorized', jwtToken)

        return {
            principalId: jwtToken.sub,
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
        }
    } catch (ex) {
        console.log('error: ', ex);
        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
};

function verifyToken(authHeader: string): JwtToken {
    console.log('verifyToken:', authHeader);
    if (!authHeader)
        throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')

    const split = authHeader.split(' ')
    const token = split[1]

    return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}