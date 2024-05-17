import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';

export function serverError(error: any): APIGatewayProxyResult {
    return { statusCode: 500, body: 'Server error: ' + JSON.stringify(error) };
}

export function notFoundResponse(): APIGatewayProxyResult {
    return { statusCode: 404, body: 'Not found', headers: { 'Content-Type': 'text/plain' } };
}

export type S3Error = {
    name: string
}

export function isS3Error(obj: any): obj is S3Error {
    return typeof obj === 'object'
        && obj.hasOwnProperty('name')
        && typeof obj.name === 'string';
}