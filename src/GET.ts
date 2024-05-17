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
        if (!event.requestContext.path.endsWith('/')) {
            const newLocation = event.requestContext.path + '/';
            return { statusCode: 302, body: '', headers: { 'Content-Type': 'text/html', 'Location': newLocation }}
        }

        try {
            const withTrailingSlash = url.endsWith('/') ? url : (url + '/');
            const withoutTrailingSlash = url.endsWith('/') ? url.substring(url.length - 1) : url;
            const command = new ListObjectsV2Command({ Bucket: bucket, Prefix: withTrailingSlash });
            const data = await s3.send(command);

            const files = getFilesForDir(withoutTrailingSlash, data.Contents ?? []);
            if (!files.length) {
                return { statusCode: 404, body: 'Not found', headers: { 'Content-Type': 'text/html' } }
            }

            const body = buildHTML(withoutTrailingSlash, files);
            return { statusCode: 200, body, headers: { 'Content-Type': 'text/html' } };
        }
        catch (e) {
            return {
                statusCode: 404,
                body: JSON.stringify(e)
            }
        }
    }
}

function getFilesForDir(url: string, objs: _Object[]): File[] {
    const urlParts = url.split('/');
    const nameToFile = new Map<string, File>();
    for (let obj of objs) {
        const keyParts = obj.Key.split('/');
        // Get the first part after the URL
        let name = keyParts[urlParts.length];
        const isDir = !isMavenFile(name);
        if (isDir) name += '/';
        let lastModified = obj.LastModified ?? new Date();
        if (isDir) {
            const oldMillis = nameToFile.get(name)?.lastModified?.getMilliseconds() ?? 0;
            if (oldMillis > lastModified.getTime()) {
                lastModified = new Date(oldMillis);
            }
        }
        nameToFile.set(name, {
            name,
            lastModified,
            size: obj.Size ?? 0,
            isDir
        });
    }
    return [...nameToFile.values()];
}
