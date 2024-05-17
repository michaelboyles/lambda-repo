import { ApiGatewayRequest, ApiGatewayResponse } from './aws'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Handler } from 'aws-lambda'
import { isMavenFile, parseMavenGAV } from './common';

const region = process.env.AWS_REGION;
const bucket = process.env.BUCKET;
const s3 = new S3Client({ region });

export const handler: Handler = async function(event: ApiGatewayRequest, _context): Promise<ApiGatewayResponse> {
    const url = decodeURIComponent(event.pathParameters.url);
    if (!isMavenFile(url)) {
        return { statusCode: 400, body: 'Invalid file' };
    }
    try {
        const gav = parseMavenGAV(url);

        const command = new PutObjectCommand({
            Bucket: bucket, Key: url, Body: event.body
        });
        await s3.send(command);
        return { statusCode: 200, body: 'Uploaded' }
    }
    catch (e) {
        return {
            statusCode: 500, body: 'Error: ' + JSON.stringify(e)
        }
    }
}
