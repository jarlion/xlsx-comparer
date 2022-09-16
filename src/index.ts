import { Command } from 'commander';
import { init } from './main';

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
        init(options);
    });

program.parse();