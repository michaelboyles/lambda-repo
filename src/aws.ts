export interface ApiGatewayRequest {
    body: string
    queryStringParameters: any
    pathParameters: any
    requestContext: {
        path: string
    }
}

export interface ApiGatewayResponse {
    statusCode: number
    headers?: object
    body: string
    isBase64Encoded?: boolean
}

export function serverError(error: any): ApiGatewayResponse {
    return { statusCode: 500, body: 'Server error: ' + JSON.stringify(error) };
}

export function notFoundResponse(): ApiGatewayResponse {
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