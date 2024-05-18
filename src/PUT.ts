import { serverError } from './aws'
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { APIGatewayProxyHandler } from 'aws-lambda'
import { isMavenFile, parseFilePath } from './common';

const region = process.env.AWS_REGION;
const bucket = process.env.BUCKET;
const s3 = new S3Client({ region });

export const handler: APIGatewayProxyHandler = async function(event, _context) {
    const givenUrl = event?.pathParameters?.url;
    if (!givenUrl) return serverError('Configuration error');
    const url = decodeURIComponent(givenUrl);
    if (!event.body || !isMavenFile(url)) {
        return { statusCode: 400, body: 'Invalid file' };
    }
    try {
        const file = parseFilePath(url);
        await s3.send(new PutObjectCommand({ Bucket: bucket, Key: url, Body: event.body }));
        return { statusCode: 200, body: 'Uploaded' }
    }
    catch (e) {
        return serverError(e);
    }
}
