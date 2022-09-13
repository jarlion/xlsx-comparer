
export function createHtml(body: string): string {
    return `
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
    </head>
    <body>
        ${body}
    </body>
</html>`;
}

export function createTable<T extends object>(data: T[], indents: string = ''): string {
    let table = `
${indents}<table border="1">
${indents}${indents}<tr>`;

    const cols = Object.keys(data[0]);
    cols.forEach(h => {
        table += `<th>${h}</th>`;
    });
    table += `${indents}${indents}</tr>`;

    for (let i = 1; i < data.length; i++) {
        table += `${indents}<tr>\n`;
        let row = `${indents}<tr>\n`;
        for (let j = 0; j < cols.length; j++) {
            const prop = cols[j];
            // @ts-ignore
            row += `${indents}<td>${data[i][prop]}</td>`;
        }
        row += `${indents}</tr>\n`;
        table += row;
        table += `${indents}</tr>\n`;
    }
    table += `${indents}</table>\n`;
    return table;
}