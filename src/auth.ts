import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { APIGatewayTokenAuthorizerHandler } from 'aws-lambda/trigger/api-gateway-authorizer';

const passwordSecretName = process.env.PASSWORD_SECRET_NAME;
const region = process.env.AWS_REGION;
const client = new SecretsManagerClient({ region });
const allowedArn = process.env.ALLOWED_ARN;

export const handler: APIGatewayTokenAuthorizerHandler = async function(event, _context) {
    const passwordResponse = await client.send(
        new GetSecretValueCommand({ SecretId: passwordSecretName })
    );
    const requiredPassword = passwordResponse.SecretString;
    if (requiredPassword !== '') {
        if (!event.authorizationToken) throw new Error('Unauthorized');
        const { username, password } = getCredentials(event.authorizationToken);
        if (username !== 'LambdaRepo' || password !== requiredPassword) {
            throw new Error('Unauthorized');
        }
    }

    return {
        principalId: 'LambdaRepo',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Allow',
                    Resource: [allowedArn]
                }
            ]
        }
    }
}

function getCredentials(authorization: string) {
    const encodedValue = authorization.split(' ')[1];
    const plainText = Buffer.from(encodedValue, 'base64').toString();
    const colonPos = plainText.indexOf(':')
    if (colonPos < 0) throw new Error('Unauthorized');
    const tokens = plainText.split(':');
    return {
        username: tokens[0],
        password: tokens[1]
    }
}