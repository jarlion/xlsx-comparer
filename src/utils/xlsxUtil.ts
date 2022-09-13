import { readFile, Sheet2JSONOpts, utils } from 'xlsx';

export function readXlsx<R>(path: string, sheetIndex: number = 0, opts?: Sheet2JSONOpts | undefined): R[] {

    const wb = readFile(path);
    const sheetName: string = wb.SheetNames[sheetIndex];
    if (!wb.Sheets[sheetName]) {
        console.error(`> !!! 找不到 Sheet ${sheetName}`);
        return [];
    }
    const sheet = wb.Sheets[sheetName];
    const rows = utils.sheet_to_json<R>(sheet, opts);
    return rows;
}