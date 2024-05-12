export interface ApiGatewayRequest {
    body: string;
    queryStringParameters: any;
    pathParameters: any;
}

export interface ApiGatewayResponse {
    statusCode: number;
    headers?: object,
    body: string;
}
