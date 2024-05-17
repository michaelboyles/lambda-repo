export type File = {
    name: string
    lastModified: Date
    isDir: boolean
    size?: number
}

export const binarySuffixes = ['.jar', '.war', '.ear', '.zip'] as const;
export const xmlSuffixes = ['.xml', '.pom'] as const;
export const checksumSuffixes = ['.sha1', '.sha256', '.md5'] as const;
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
export function parseMavenGAV(path: string) {
    if (!path.includes('/')) throw new Error('Invalid GAV');
    const parts = path.split("/");
    if (parts.length < 4) throw new Error('Invalid GAV');
    const file = parts[parts.length - 1];
    if (!isMavenFile(file)) throw new Error('Invalid GAV');
    const version = parts[parts.length - 2];
    if (version.length < 1) throw new Error('Invalid GAV');
    const isSnapshot = version.endsWith('-SNAPSHOT');
    const artifactId = parts[parts.length - 3];
    if (artifactId.length < 1) throw new Error('Invalid GAV');

    let groupId = '';
    for (let i = 0; i <= parts.length - 4; i++) {
        const groupPart = parts[i];
        if (groupPart.length < 1) throw new Error('Invalid GAV');
        groupId += groupPart;
        if (i < parts.length - 4) {
            groupId += '.';
        }
    }
    return { file, version, artifactId, groupId, isSnapshot }
}

// TODO exists above version, e.g. org/slf4j/slf4j-api/maven-metadata.xml
export function isMetaDataFile(path: string) {
    return path.endsWith('maven-metadata.xml')
        || path.endsWith('maven-metadata.xml.md5')
        || path.endsWith('maven-metadata.xml.sha1');
}