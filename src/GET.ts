import { isS3Error, notFoundResponse, serverError } from './aws'
import { S3Client, GetObjectCommand, ListObjectsV2Command, _Object } from "@aws-sdk/client-s3";
import { APIGatewayProxyHandler } from 'aws-lambda'
import { isMavenFile, File, isBinaryFile, isXMLFile } from './common';
import { buildHTML } from './list-directory';

const region = process.env.AWS_REGION;
const bucket = process.env.BUCKET;
const s3 = new S3Client({ region });

export const handler: APIGatewayProxyHandler = async function(event, _context) {
    // url is only missing for the default route (the one called 'ApiGatewayMethodGETROOT' in cft.yaml)
    const requestUrl = event.pathParameters?.url ?? '/';
    const url = decodeURIComponent(requestUrl);
    if (isMavenFile(url)) {
        try {
            const command = new GetObjectCommand({ Bucket: bucket, Key: url });
            const data = await s3.send(command);

            if (!data.Body) return serverError('File has no body');
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
            const contentType = isXMLFile(url) ? 'text/xml' : 'text/plain';
            return {
                statusCode: 200,
                body: await data.Body.transformToString('UTF-8'),
                headers: { "Content-Type": contentType }
            }
        }
        catch (e) {
            if (isS3Error(e) && e.name === 'NoSuchKey') {
                return notFoundResponse();
            }
            return serverError(e);
        }
    }
    else {
        if (!event.requestContext.path.endsWith('/')) {
            const newLocation = event.requestContext.path + '/';
            return { statusCode: 302, body: '', headers: { 'Content-Type': 'text/html', 'Location': newLocation }}
        }

        try {
            const withoutTrailingSlash = url.endsWith('/') ? url.substring(url.length - 1) : url;
            const command = new ListObjectsV2Command({ Bucket: bucket, Prefix: getPrefixForUrl(url) });
            const data = await s3.send(command);

            const files = getFilesForDir(withoutTrailingSlash, data.Contents ?? []);
            if (!files.length) {
                return notFoundResponse();
            }

            const body = buildHTML(withoutTrailingSlash, files);
            return { statusCode: 200, body, headers: { 'Content-Type': 'text/html' } };
        }
        catch (e) {
            return serverError(e);
        }
    }
}

function getPrefixForUrl(url: string) {
    if (url === '/') return undefined;
    if (url.endsWith('/')) return url;
    return url + '/'; // should never get here, but may as well make sure
}

function getFilesForDir(url: string, objs: _Object[]): File[] {
    const urlParts = (url === '/') ? [] : url.split('/');
    const nameToFile = new Map<string, File>();
    for (let obj of objs) {
        if (!obj.Key) continue;
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
