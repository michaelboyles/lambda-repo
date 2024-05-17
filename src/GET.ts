import { ApiGatewayRequest, ApiGatewayResponse } from './aws'
import { S3Client, GetObjectCommand, ListObjectsV2Command, _Object } from "@aws-sdk/client-s3";
import { Handler } from 'aws-lambda'
import { isMavenFile, File, isBinaryFile, isXMLFile } from './common';
import { buildHTML } from './list-directory';

const region = process.env.AWS_REGION;
const bucket = process.env.BUCKET;
const s3 = new S3Client({ region });

export const handler: Handler = async function(event: ApiGatewayRequest, _context): Promise<ApiGatewayResponse> {
    const url = decodeURIComponent(event.pathParameters.url);
    if (isMavenFile(url)) {
        try {
            const command = new GetObjectCommand({ Bucket: bucket, Key: url });
            const data = await s3.send(command);

            if (isBinaryFile(url)) {
                return {
                    statusCode: 200,
                    body: await data.Body.transformToString('base64'),
                    headers: {
                        "Content-Type": "application/java-archive"
                    },
                    isBase64Encoded: true
                };
            }
            else {
                const contentType = isXMLFile(url) ? 'text/xml' : 'text/plain';
                return {
                    statusCode: 200,
                    body: await data.Body.transformToString('UTF-8'),
                    headers: { "Content-Type": contentType }
                }
            }
        }
        catch (e) {
            return {
                statusCode: 404, body: 'Error: ' + JSON.stringify(e)
            }
        }
    }
    else {
        try {
            let dirUrl = url.endsWith('/') ? url : (url + '/');
            const command = new ListObjectsV2Command({ Bucket: bucket,  Prefix: dirUrl });
            const data = await s3.send(command);

            const files = getFilesForDir(dirUrl, data.Contents ?? []);
            return {
                statusCode: 200,
                body: buildHTML(dirUrl, files),
                headers: { 'Content-Type': 'text/html' }
            }
        }
        catch (e) {
            return {
                statusCode: 404,
                body: JSON.stringify(e)
            }
        }
    }
}

function getFilesForDir(url: string, objs: _Object[]) {
    const urlParts = url.split('/');
    const files: File[] = [];
    for (let obj of objs) {
        const keyParts = obj.Key.split('/');
        if (keyParts.length === urlParts.length + 1) {
            files.push({
                key: obj.Key,
                name: keyParts[keyParts.length - 1],
                lastModified: obj.LastModified ?? new Date(),
                size: obj.Size ?? 0
            })
        }
    }
    return files;
}

