import { isKeyDuplication, pick, str2arr } from "../../utils/dataUtil";
import { resolve } from 'path';

export class InitOptions {

    key!: string;
    head!: number;

    /** 源文件路径 */
    sourcePath!: string;

    /** 目标路径 */
    targetPath!: string;

    /** 显示的列 */
    displayColumns: string[] = [];

    autoHideSameColumns: boolean = false;

    /** 需要显示的列，多个用 , 连接 */
    includeColumns: string[] = [];
    /** 需要排除的列，多个用 , 连接 */
    excludeColumns: string[] = [];

    /** 是否启动 web 服务器 */
    web!: boolean;
    /** 如果启动 web 把服务器，web 服务器端口号 */
    port?: number;

    /** 是否过滤模式 */
    filter: boolean = false;

    parse(params: any): this {
        const { port, key, source, target, web, head, includeColumns, excludeColumns, filter } = params;

        if (!key) throw new Error(`> !!! 请指定用于对确定行数据的字段序号，或列名 ${key}`);

        this.web = web;

        this.key = key;
        this.filter = filter;
        this.head = parseInt(head, 10);
        this.port = parseInt(port, 10);


        this.sourcePath = resolve(process.cwd(), source);
        this.targetPath = resolve(process.cwd(), target);

        this.includeColumns = str2arr(includeColumns);
        this.excludeColumns = str2arr(excludeColumns);
        return this;
    }

    getDisplayColumns(head: any): string[] {
        // this.includeColumns = this.includeColumns.map()
        // 如果没有配置包含的列，自动隐藏相同列
        const iColumns = this.includeColumns.length === 0 ? Object.keys(head) : this.includeColumns;

        const columns = new Set([this._getColumnName(head, this.key), ...iColumns]);

        for (let ex of this.excludeColumns) columns.delete(ex);
        this.displayColumns = Array.from(columns).map(c => this._getColumnName(head, c));
        this.displayColumns.unshift('$rank');
        return this.displayColumns;
    }

    protected _getColumnName(head: any, key: string): string {
        if (head[key]) return key;
        for (const k in head) {
            if (Object.prototype.hasOwnProperty.call(head, k) && head[k] === key) {
                return k;

            }
        }
        throw new Error(`主键错误:${key}`);
        return '';
    }

    pickProps(data: any[]): any[] {
        return data.map((d, index) => pick(d, this.displayColumns, { $rank: index + 1 }));
    }

    validate(rows: any[], xlsxPath: string): this {
        // 校验 key 是否重复
        let index = isKeyDuplication(rows, this.key);
        if (index !== -1) throw new Error(`> !!! ${xlsxPath} 的 ${this.key} 列, 第 ${index} 行重复`);
        return this;
    }
}