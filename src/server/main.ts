/**
 * 主程序
 */
import { CompareResult, str2arr } from '../utils/dataUtil';
import { div, html, HTML, IHTMLContainer, IHTMLElement, Indent, link, span, table, td, th, tr } from '../utils/htmlUtil';
import { resolve } from 'path';
import { Web } from './Web';
import { compare, isKeyDuplication } from '../utils/dataUtil';
import { copySync, openUrl, saveSync } from '../utils/osUtil';
import { readXlsx } from '../utils/xlsxUtil';

interface IInitOptions {
    key: string;
    head: string;

    /** 源文件路径 */
    source: string;

    /** 目标路径 */
    target: string;

    /** 需要显示的列，多个用 , 连接 */
    includeColumns: string;
    /** 需要排除的列，多个用 , 连接 */
    excludeColumns: string;

    /** 是否启动 web 服务器 */
    web: boolean;
    /** 如果启动 web 把服务器，web 服务器端口号 */
    port?: string;
}

/**
 * 初始化程序
 * @param options 
 */
export function init(options: IInitOptions) {
    const { port, key, source, target, web, includeColumns, excludeColumns, head, filter } = options;
    if (!key) throw new Error(`> !!! 请指定用于对确定行数据的字段序号，或列名 ${key}`);
    const sourcePath = resolve(process.cwd(), source);
    const targetPath = resolve(process.cwd(), target);
    const sourceData = readXlsx<{}>(sourcePath);
    // 校验 key 是否重复
    let index = isKeyDuplication(sourceData, key);
    if (index !== -1) throw new Error(`> !!! ${sourcePath} 的 ${key} 列, 第 ${index} 行重复`);
    const targetData = readXlsx<{}>(targetPath);

    // 校验 key 是否重复
    index = isKeyDuplication(targetData, key);
    if (index !== -1) throw new Error(`> !!! ${targetPath} 的 ${key} 列, 第 ${index} 行重复`);

    const iColumns = str2arr(includeColumns);
    iColumns.unshift(key);
    const eColumns = str2arr(excludeColumns);

    const sourceRows = filterData(sourceData, iColumns, eColumns);
    const targetRows = filterData(targetData, iColumns, eColumns);
    // 对比表格差异
    const res = compare(sourceRows, targetRows, key, parseInt(head, 10), iColumns);
    iColumns.unshift('$rank'); // 比较后再加入序号，防止序号加入判断

    // 去除相同的行及列

    console.log(res);
    const htm = makeHtml(filter ? sourceRows.filter(res.isSame(key)) : sourceRows,
        filter ? targetRows.filter(res.isSame(key)) : targetRows,
        iColumns,
        res,
        options);
    // console.dir(htm);

    // 保存主页
    saveSync('bin/client/main.html', htm.toString());

    // 初始化页面资源
    const root = initWebDir('bin/client');

    // 启动 web 服务器
    if (web) {
        new Web(root,
            Number(port),
            () =>
                openUrl(`http://localhost:${port}/main.html`)
        );
    }
}

/**
 * 初始化 web 目录
 */
function initWebDir(dir: string): string {
    //
    copySync('src/client/css/comparer.css', `${dir}/css/comparer.css`);
    return dir;
}

/**
 * 创建结果回显页面
 * @param sourceRows 源文件行数据
 * @param targetRows 目标文件行数据
 * @param res 
 * @param key 表格主键
 * @returns 
 */
function makeHtml(sourceRows: any[], targetRows: any[], displayColumns: string[], res: CompareResult, options: IInitOptions): HTML {
    return html('Xlsx Comparer')
        .append(link('./css/comparer.css'))
        .append(div().setClass('main')
            // 图例说明
            .append(div().setClass('intro')
                .append(span('相同'))
                .append(span('新增').setClass('new'))
                .append(span('不同').setClass('diff'))
                .append(span('删除').setClass('del')))
            // 对比表格
            .append(div().setClass('pane')
                .append(div([div(options.source).appendClass('file-path'),
                makeTable(sourceRows, displayColumns, options, (col, r) => res.isNew(r) ? 'del' : res.idDiff(col, r) ? 'diff' : '')]))
                .append(div([div(options.target).appendClass('file-path'),
                makeTable(targetRows, displayColumns, options, (col, r) => res.getLink(r) === -1 ? 'new' : res.idDiff(col, res.getLink(r)) ? 'diff' : '')])))
        );
}

/**
 * 过滤数据
 * @param rows 原始的行数据
 * @param includeColumns 包含显示的列
 * @param excludeColumns 排除显示的列
 * @returns 过滤后的数据
 */
function filterData(rows: any[], includeColumns: string[], excludeColumns: string[]): any[] {
    const columns = new Set(includeColumns);
    for (let ex of excludeColumns) columns.delete(ex);
    return rows?.map((r, index) => {
        const item: Record<string, any> = {};
        // 过滤数据之后会序号会乱，先存下来
        for (const prop of columns) item[prop] = r[prop];
        item.$rank = index + 1;
        return item;
    });
}

/**
 * 创建显示结果的表格
 * @param data 表格内容数据
 * @param key 表格主键
 * @param eachFn 
 * @param indents 
 * @returns 
 */
function makeTable<T extends Record<string, string | number>>(data: T[], cols: string[], options: IInitOptions, eachFn: (colName: string, row: number) => string, indents: string = ''): IHTMLContainer {
    const { key, head } = options;
    const rowsHead = parseInt(head, 10);
    let tbody: IHTMLElement[] = [];
    const ind = new Indent(indents);

    // 添加表头
    const tableHeadRows: IHTMLContainer[] = [];
    cols.forEach((col, colIndex) => {
        for (let rowIndex = 0; rowIndex < rowsHead; rowIndex++) {
            const headRowData = data[rowIndex];
            const cell = headRowData[col];
            const tableHeader = th(cell.toString()).setAttribute('title', cell.toString(), true);
            if (col === key) tableHeader.appendClass('key');
            if (!tableHeadRows[rowIndex]) tableHeadRows[rowIndex] = tr();
            // 判断是否合并行 TODO
            if (cell === undefined || cell === '' || cell === null) {
                // console.log(`-------`, rowIndex, colIndex, col, headRowData, tableHeadRows[0].getChildAt(colIndex));
                tableHeadRows[0].getChildAt(colIndex)?.setAttribute('rowspan', (rowIndex + 1).toString());
            }
            else {
                tableHeadRows[rowIndex].append(tableHeader);
            }
        }
    });

    // 表格内容
    ind.reduce();
    for (let i = rowsHead; i < data.length; i++) {
        let row: IHTMLElement[] = [];
        const rank: number = data[i].$rank as number;

        // 如果是不同项，添加样式
        let prop = '';
        let cls = eachFn && eachFn(prop, rank - 1);
        // 添加序号
        row.push(td((rank).toString()).setClass(`${cls ?? ''} rank`));

        for (let j = 1; j < cols.length; j++) {
            prop = cols[j];
            // 如果是不同项，添加绿底
            cls = eachFn && eachFn(prop, rank - 1);
            const cell = data[i][prop] ?? '';

            row.push(td(cell.toString())
                .appendClass(cls ?? '')
                .appendClass(prop === key ? 'key' : '')
                .setAttribute('title', cell.toString(), true));
        }
        tbody.push(tr(row, ind.add().toString()));
        ind.reduce();
    }
    return table(tbody, ind.toString())
        .head()
        .appendAll(tableHeadRows).parent as IHTMLContainer;
}