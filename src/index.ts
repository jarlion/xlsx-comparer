import { Command } from 'commander';
import { resolve } from 'path';
import { Web } from './app/App';
import { compare, isKeyDuplication } from './utils/dataUtil';
import { div, html, HtmlContainer, IHTMLElement, Indent, link, table, td, th, tr } from './utils/htmlUtil';
import { copySync, openUrl, saveSync } from './utils/osUtil';
import { readXlsx } from './utils/xlsxUtil';

const program = new Command();

program
    .name('xlsx-comparer')
    .alias('xc')
    .description('xlsx 比较')
    .version('0.0.1')

    .option('-s, --source <string>', 'source *.xlsx', ',')
    .option('-t, --target <string>', 'target *.xlsx')
    .option('-k, --key <string>', 'key num|str')
    .option('-i, --include <string[]>', '包含的列 string[]')
    .option('-e, --exclude <string[]>', '排除的列 string[]')
    .option('-s, --simple <boolean>', '简单模式， 此模式不现实相同的列', false)
    .action((options) => {
        const { key, source, target } = options;
        if (!key) throw new Error(`> !!! 请指定用于对确定行数据的字段序号，或列名 ${key}`);
        const sourcePath = resolve(process.cwd(), source);
        const targetPath = resolve(process.cwd(), target);
        const sourceRows = readXlsx<{}>(sourcePath);
        // 校验 key 是否重复
        let index = isKeyDuplication(sourceRows, key);
        if (index !== -1) throw new Error(`> !!! 指定的键, 第 ${index} 行重复`);
        const targetRows = readXlsx<{}>(targetPath);
        console.log(sourceRows);
        console.log(targetRows);

        // 校验 key 是否重复
        index = isKeyDuplication(targetRows, key);
        if (index !== -1) throw new Error(`> !!! 指定的键, 第 ${index} 行重复`);

        const res = compare(sourceRows, targetRows, key);
        console.log(res);
        const htm = html('Xlsx Comparer')
            .append(link('./css/comparer.css'))
            .append(div().setClass('pane')
                .append(div(makeTable(sourceRows, (col, r) => res.idDiff(col, r) ? 'diff' : '')))
                .append(div(makeTable(targetRows, (col, r) => res.idDiff(col, r) ? 'diff' : res.isNew(r) ? 'new' : ''))));
        console.dir(htm);
        saveSync('bin/static/compare.html', htm.toString());

        const root = initWebDir('bin/static');

        new Web(root,
            8100,
            () =>
                openUrl('http://localhost:8100/compare.html')
        );

    });

/**
 * 初始化 web 目录
 */
function initWebDir(dir: string): string {
    //
    copySync('src/static/css/comparer.css', `${dir}/css/comparer.css`);
    return dir;
}

function makeTable<T extends Record<string, string>>(data: T[], eachFn: (colName: string, row: number) => string, indents: string = ''): HtmlContainer {
    let tbody: IHTMLElement[] = [];
    const ind = new Indent(indents);

    const cols = Object.keys(data[0]);
    const head: IHTMLElement[] = [th()];
    cols.forEach(h => head.push(th(h)));
    tbody.push(tr(head, ind.add().toString()));

    ind.reduce();
    for (let i = 0; i < data.length; i++) {
        let row: IHTMLElement[] = [];

        // 如果是不同项，添加样式
        let prop = '';
        const cls = eachFn && eachFn(prop, i);
        // 添加序号
        row.push(td((i + 2).toString()).setClass(cls ? cls + ' index' : 'index'));

        for (let j = 0; j < cols.length; j++) {
            prop = cols[j];
            // 如果是不同项，添加绿底
            const cls = eachFn && eachFn(prop, i);
            const cell = data[i][prop] ?? '';
            row.push(td(cell).setClass(cls ? cls : '').setAttribute('title', cell));
        }
        tbody.push(tr(row, ind.add().toString()));
        ind.reduce();
    }
    return table(tbody, ind.toString());
}

program.parse();