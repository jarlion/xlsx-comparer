import { readFile, Sheet2JSONOpts, utils } from "xlsx";

/**
 * 读取 xlsx
 * @param path
 * @param sheetIndex
 * @param opts
 * @param fix 是否在没有配置的时候把表头添加到数据中
 * @returns
 */
export function readXlsx<R extends Record<string, string>>(
  path: string,
  sheetIndex: number = 0,
  opts: Sheet2JSONOpts | undefined = { header: "A", defval: "" },
  fix: boolean = true
): R[] {
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
