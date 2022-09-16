/**
 * 主程序
 */
import { CompareResult } from './utils/dataUtil';
import { div, html, HTML, HtmlContainer, IHTMLElement, Indent, link, span, table, td, th, tr } from './utils/htmlUtil';
import { resolve } from 'path';
import { Web } from './app/App';
import { compare, isKeyDuplication } from './utils/dataUtil';
import { copySync, openUrl, saveSync } from './utils/osUtil';
import { readXlsx } from './utils/xlsxUtil';

/**
 * 初始化程序
 * @param options 
 */
export function init(options: any) {
    const { port, key, source, target } = options;
    if (!key) throw new Error(`> !!! 请指定用于对确定行数据的字段序号，或列名 ${key}`);
    const sourcePath = resolve(process.cwd(), source);
    const targetPath = resolve(process.cwd(), target);
    const sourceRows = readXlsx<{}>(sourcePath);
    // 校验 key 是否重复
    let index = isKeyDuplication(sourceRows, key);
    if (index !== -1) throw new Error(`> !!! ${sourcePath} 的 ${key} 列, 第 ${index} 行重复`);
    const targetRows = readXlsx<{}>(targetPath);
    console.log(sourceRows);
    console.log(targetRows);

    // 校验 key 是否重复
    index = isKeyDuplication(targetRows, key);
    if (index !== -1) throw new Error(`> !!! ${targetPath} 的 ${key} 列, 第 ${index} 行重复`);

    // 对比表格差异
    const res = compare(sourceRows, targetRows, key);
    console.log(res);
    const htm = makeHtml(sourceRows, targetRows, res, key);
    console.dir(htm);

    // 保存主页
    saveSync('bin/static/main.html', htm.toString());

    // 初始化页面资源
    const root = initWebDir('bin/static');

    // 启动 web 服务器
    new Web(root,
        Number(port),
        () =>
            openUrl(`http://localhost:${port}/main.html`)
    );
}

/**
 * 初始化 web 目录
 */
function initWebDir(dir: string): string {
    //
    copySync('src/static/css/comparer.css', `${dir}/css/comparer.css`);
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
function makeHtml(sourceRows: any[], targetRows: any[], res: CompareResult, key: string): HTML {
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
                .append(div(makeTable(sourceRows, key, (col, r) => res.isNew(r) ? 'del' : res.idDiff(col, r) ? 'diff' : '')))
                .append(div(makeTable(targetRows, key, (col, r) => res.getLink(r) === -1 ? 'new' : res.idDiff(col, res.getLink(r)) ? 'diff' : ''))))
        );
}

/**
 * 创建显示结果的表格
 * @param data 表格内容数据
 * @param key 表格主键
 * @param eachFn 
 * @param indents 
 * @returns 
 */
function makeTable<T extends Record<string, string>>(data: T[], key: string, eachFn: (colName: string, row: number) => string, indents: string = ''): HtmlContainer {
    let tbody: IHTMLElement[] = [];
    const ind = new Indent(indents);

    const cols = Object.keys(data[0]);
    const head: IHTMLElement[] = [th()];
    cols.forEach(h => {
        const tableHeader = th(h);
        if (h === key) tableHeader.appendClass('key');
        head.push(tableHeader);
    });
    tbody.push(tr(head, ind.add().toString()));

    ind.reduce();
    for (let i = 0; i < data.length; i++) {
        let row: IHTMLElement[] = [];

        // 如果是不同项，添加样式
        let prop = '';
        const cls = eachFn && eachFn(prop, i);
        // 添加序号
        row.push(td((i + 2).toString()).setClass(`${cls ?? ''} index`));

        for (let j = 0; j < cols.length; j++) {
            prop = cols[j];
            // 如果是不同项，添加绿底
            const cls = eachFn && eachFn(prop, i);
            const cell = data[i][prop] ?? '';

            row.push(td(cell)
                .appendClass(cls ?? '')
                .appendClass(prop === key ? 'key' : '')
                .setAttribute('title', cell, true));
        }
        tbody.push(tr(row, ind.add().toString()));
        ind.reduce();
    }
    return table(tbody, ind.toString());
}