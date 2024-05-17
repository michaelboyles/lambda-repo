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