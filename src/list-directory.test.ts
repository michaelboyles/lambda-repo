import { File } from './common'
import { buildHTMLRow } from './list-directory';

test('Normal row', () => {
    const file: File = {
        key: 'key',
        name: 'name.jar',
        lastModified: new Date(0),
        size: 100
    };
    expect(buildHTMLRow(file)).toBe(
        '<a href="name.jar" title="name.jar">name.jar</a>                                          1970-01-01 00:00       100'
    );
})

test('Long name', () => {
    const file: File = {
        key: 'key',
        name: 'very-very-very-very-very-very-very-very-long-name.jar',
        lastModified: new Date(0),
        size: 99999
    };
    expect(buildHTMLRow(file)).toBe(
        '<a href="very-very-very-very-very-very-very-very-long-name.jar" title="very-very-very-very-very-very-very-very-long-name.jar">very-very-very-very-very-very-very-very-long-...</a>  1970-01-01 00:00     99999'
    );
})