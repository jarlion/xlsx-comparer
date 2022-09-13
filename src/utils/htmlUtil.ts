
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
    <table border="1">
  <tr>
    <th>Month</th>
    <th>Savings</th>
  </tr>
  `;
    const cols = Object.keys(data[0]);
    for (let i = 1; i < data.length; i++) {
        table += `${indents}<tr>\n`;
        let row = `${indents}<tr>\n`;
        for (let j = 0; j < cols.length; j++) {
            const prop = cols[j];
            // @ts-ignore
            row += `${indents}<td>${data[i][prop]}</td>`;
        }
        row += `${indents}</tr>\n`;
        // < td > January < /td>
        // < td > $100 < /td>;
        table += row;
        table += `${indents}</tr>\n`;
    }
    table += `${indents}</table>\n`;
    return table;
}