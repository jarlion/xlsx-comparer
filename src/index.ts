import { Command } from 'commander';
import { resolve } from 'path';
import { Web } from './app/App';
import { makeHtml, makeTable } from './main';
import { compare, isKeyDuplication } from './utils/dataUtil';
import { div, html, link, span } from './utils/htmlUtil';
import { copySync, openUrl, saveSync } from './utils/osUtil';
import { readXlsx } from './utils/xlsxUtil';

/**
 * 命令入口
 */
const program = new Command();

program
    .name('xlsx-comparer')
    .alias('xc')
    .description('xlsx 比较')
    .version('0.0.1')

    .option('-p, --port <number>', '网页端口', '8100')
    .option('-s, --source <string>', 'source *.xlsx', ',')
    .option('-t, --target <string>', 'target *.xlsx')
    .option('-k, --key <string>', 'key num|str')
    .option('-i, --include <string[]>', '包含的列 string[]')
    .option('-e, --exclude <string[]>', '排除的列 string[]')
    .option('-s, --simple <boolean>', '简单模式， 此模式不现实相同的列', false)
    .action((options) => {
        const { port, key, source, target } = options;
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
        const htm = makeHtml(sourceRows, targetRows, res);
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

    });

/**
 * 初始化 web 目录
 */
function initWebDir(dir: string): string {
    //
    copySync('src/static/css/comparer.css', `${dir}/css/comparer.css`);
    return dir;
}

program.parse();