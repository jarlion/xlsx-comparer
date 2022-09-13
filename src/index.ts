import { Command } from 'commander';
import { readXlsx } from './utils/xlsxUtil';
import { resolve } from 'path';
import { compare, isKeyDuplication } from './utils/dataUtil';
import { createHtml, createTable } from './utils/htmlUtil';
import { openUrl, saveSync } from './utils/osUtil';
import { Web } from './app/App';

const program = new Command();

program
    .name('xlsx-comparer')
    .alias('xc')
    .description('xlsx 比较')
    .version('0.0.1')

    .option('-s, --source <string>', 'source *.xlsx', ',')
    .option('-t, --target <string>', 'target *.xlsx')
    .option('-k, --key <string>', 'key num|str')
    .action((options) => {
        const { key, source, target } = options;
        if (!key) throw new Error(`> !!! 请指定用于对确定行数据的字段序号，或列名 ${key}`);
        const sourcePath = resolve(__dirname, source);
        const targetPath = resolve(__dirname, target);
        const sourceRows = readXlsx<{}>(sourcePath);
        // 校验 key 是否重复
        let index = isKeyDuplication(sourceRows, key);
        if (index !== -1) throw new Error(`> !!! 指定的键, 第 ${index} 行重复`);
        const targetRows = readXlsx(targetPath);
        console.log(sourceRows);
        console.log(targetRows);

        const html = createHtml(createTable(sourceRows));
        console.log(html);
        saveSync('bin/static/compare.html', html);
        // 校验 key 是否重复
        index = isKeyDuplication(targetRows, key);
        if (index !== -1) throw new Error(`> !!! 指定的键, 第 ${index} 行重复`);

        console.log(compare(sourceRows, targetRows, key));

        new Web('static',
            8100,
            () =>
                openUrl('http://localhost:8100/compare.html')
        );

    });

program.parse();