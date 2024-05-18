import { isS3Error, serverError } from './aws'
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
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

    let file: ReturnType<typeof parseFilePath>;
    try {
        file = parseFilePath(url);
    }
    catch (e) {
        return { statusCode: 400, body: 'Invalid file path' };
    }

    if (file.type === 'normal' && !file.isSnapshot) {
        try {
            await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: url }));
            return { statusCode: 403, body: 'Cannot replace release versions. Version already exists' }
        }
        catch (e) {
            if (!(isS3Error(e) && e.name === 'NotFound')) {
                return serverError('Failed to query S3');
            }
        }
    }
    try {
        await s3.send(new PutObjectCommand({ Bucket: bucket, Key: url, Body: event.body }));
        return { statusCode: 200, body: 'Uploaded' }
    }
    catch (e) {
        return serverError(e);
    }
}
