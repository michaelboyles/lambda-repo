export type File = {
    name: string
    lastModified: Date
    isDir: boolean
    size?: number
}

export const binarySuffixes = ['.jar', '.war', '.ear', '.zip'] as const;
export const xmlSuffixes = ['.xml', '.pom'] as const;
export const checksumSuffixes = ['.sha1', '.sha256', '.sha512', '.md5'] as const;
export const signatureSuffixes = ['.asc'] as const;
export const fileSuffixes = [
    ...binarySuffixes,
    ...checksumSuffixes,
    ...xmlSuffixes,
    ...signatureSuffixes
] as const;

export function isMavenFile(path: string) {
    for (let fileSuffix of fileSuffixes) {
        if (path.endsWith(fileSuffix)) {
            return path.lastIndexOf('.') > 0;
        }
    }
    return false;
}

export function isBinaryFile(path: string) {
    for (let fileSuffix of binarySuffixes) {
        if (path.endsWith(fileSuffix)) return true;
    }
    return false;
}

export function isXMLFile(path: string) {
    for (let fileSuffix of xmlSuffixes) {
        if (path.endsWith(fileSuffix)) return true;
    }
    return false;
}

// e.g. org/slf4j/slf4j-api/2.0.0/slf4j-api-2.0.0.pom
//      org/slf4j/slf4j-api/maven-metadata.xml
export function parseFilePath(path: string) {
    if (!path.includes('/')) throw new Error('Invalid GAV');
    const parts = path.split("/");
    const file = parts[parts.length - 1];
    if (isMetaDataFile(file)) {
        return { type: 'metadata' };
    }
    else if (!isMavenFile(file)) {
        throw new Error('Not a valid filename')
    }

    if (parts.length < 4) throw new Error('Invalid GAV');

    const version = parts[parts.length - 2];
    if (!isValidVersion(version)) throw new Error('Invalid version ' + version);
    const isSnapshot = version.endsWith('-SNAPSHOT');

    const artifactId = parts[parts.length - 3];
    if (!isValidArtifactId(artifactId)) throw new Error('Invalid artifact ID ' + artifactId);

    let groupId = '';
    for (let i = 0; i <= parts.length - 4; i++) {
        const groupPart = parts[i];
        if (!isValidGroupIdPart(groupPart)) throw new Error('Invalid group ID part ' + groupPart);
        groupId += groupPart;
        if (i < parts.length - 4) {
            groupId += '.';
        }
    }
    return { type: 'normal', file, version, artifactId, groupId, isSnapshot }
}

function isMetaDataFile(filename: string) {
    if (filename === 'maven-metadata.xml') return true;
    for (let suffix of checksumSuffixes) {
        if (filename === ('maven-metadata.xml' + suffix)) return true;
    }
    return false;
}

function isValidVersion(version: string): boolean {
    return version.length >= 1;
}

function isValidArtifactId(artifactId: string): boolean {
    return artifactId.length >= 1;
}

function isValidGroupIdPart(groupIdPart: string): boolean {
    return groupIdPart.length >= 1
        && !groupIdPart.includes('.'); // Group ID is split on periods and converted to / on upload
}