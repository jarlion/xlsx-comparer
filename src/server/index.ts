import { Command } from 'commander';
import { init } from './main';

/**
 * 命令入口
 */
const program = new Command();

program
    .name('xlsx-comparer')
    .alias('xc')
    .description('xlsx 文件对比工具')
    .version('0.0.4')

    .option('-p, --port <number>', '网页端口', '8100')
    .option('-s, --source <string>', '源文件 *.xlsx', ',')
    .option('-t, --target <string>', '目标文件 *.xlsx')
    .option('-k, --key <string>', '主键名 num|str')
    .option('-i, --include-columns <string[,]>', '包含的列 string[]', '')
    .option('-e, --excludeColumns <string[,]>', '排除的列 string[]', '')
    .option('-h, --head <number>', '表头行数', '1')
    .option('-f, --filter', '过滤模式， 此模式不显示没有差异的列', false)
    .option('-w, --web', '是否启动 Web 服务器', false)
    .action((options) => {
        init(options);
    });

program.parse();