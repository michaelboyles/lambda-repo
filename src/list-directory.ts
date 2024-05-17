import { File } from './common'

const FILE_COL_WIDTH = 50;
const SIZE_COL_WIDTH = 10;
const GAP = 2;

export function buildHTML(gav: string, files: File[]) {
    const backlink = gav.length ? '<pre id="contents"><a href="../">../</a>\n' : '';
    const links = files.map(buildHTMLRow).join('\n');
    return `
<html lang="en">
<head>
    <title>Lambda Repo Repository: ${gav}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>body { background: #fff; }</style>
</head>
<body>
<header>
    <h1>${gav}</h1>
</header>
<hr>
<main>
<pre id="contents">
${backlink}${links}
</pre>
</main>
<hr>
</body>
</html>
`
}

export function buildHTMLRow(file: File) {
    let shownFileName = file.name;
    if (file.name.length > (FILE_COL_WIDTH - GAP)) {
        const truncationMarker = '...';
        shownFileName = file.name.substring(0, FILE_COL_WIDTH - GAP - truncationMarker.length) + truncationMarker;
    }
    const link = `<a href="${file.name}" title="${file.name}">${shownFileName}</a>`;
    const size = file.isDir ? '-' : String(file.size ?? 0);
    return link
        + ' '.repeat(FILE_COL_WIDTH - shownFileName.length)
        + formatDate(file.lastModified)
        + ' '.repeat(GAP)
        + size.padStart(SIZE_COL_WIDTH - GAP, ' ');
}

function formatDate(date: Date): string {
    return date.getUTCFullYear()
        + '-' + pad(date.getUTCMonth() + 1)
        + '-' + pad(date.getUTCDate())
        + ' ' + pad(date.getUTCHours())
        + ':' + pad(date.getUTCMinutes());
}

function pad(num: number): string {
    return String(num).padStart(2, '0');
}