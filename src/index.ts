import { Command } from 'commander';
const program = new Command();

program
    .name('xlsx-comparer')
    .alias('xc')
    .description('xlsx 比较')
    .version('0.0.1');

program.command('compare')
    .description('Split a string into substrings and display as an array')
    .option('-s, --source <char>', 'source *.xlsx', ',')
    .option('-t, --first <string>', 'target *.xlsx')
    .action((str, options) => {
        const limit = options.first ? 1 : undefined;
        console.log(str.split(options.separator, limit));
    });

program.parse();