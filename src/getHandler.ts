import { ApiGatewayRequest, ApiGatewayResponse } from './aws'
import { S3Client, GetObjectCommand, ListObjectsV2Command, _Object } from "@aws-sdk/client-s3";
import type { Handler } from 'aws-lambda'

const fileSuffixes = ['.jar', '.sha1', '.sha256'];
const s3 = new S3Client({ region: "eu-west-2" });
const bucket = 'lambda-repo-test-jwzmfqas';

export const handler: Handler = async function(event: ApiGatewayRequest, _context): Promise<ApiGatewayResponse> {
    const url = decodeURIComponent(event.pathParameters.url);

    const isFile = function() {
        for (let fileSuffix of fileSuffixes) {
            if (url.endsWith(fileSuffix)) return true;
        }
        return false;
    }();

    if (isFile) {
        try {
            const command = new GetObjectCommand({ Bucket: bucket, Key: url });
            const data = await s3.send(command);

            if (url.endsWith('jar')) {
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
                const contentType = url.endsWith('.pom') ? 'text/xml' : 'text/plain';
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
            const retData = { files,  url: dirUrl };
            return {
                statusCode: 200,
                body: JSON.stringify(retData)
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

type File = {
    key: string
}
function getFilesForDir(url: string, objs: _Object[]) {
    const urlParts = url.split('/');
    const files: File[] = [];
    for (let obj of objs) {
        const keyParts = obj.Key.split('/');
        if (keyParts.length === urlParts.length + 1) {
            files.push({ key: obj.Key })
        }
    }
    return files;
}