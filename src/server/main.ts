import { ICompareResult } from "./../utils/dataUtil";
/**
 * 主程序
 */
import { InitOptions } from "../common/options/InitOptions";
import { Comparator } from "../utils/dataUtil";
import {
  HTML,
  IHTMLContainer,
  IHTMLElement,
  Indent,
  div,
  html,
  link,
  span,
  table,
  td,
  th,
  tr,
} from "../utils/htmlUtil";
import { copySync, openUrl, saveSync } from "../utils/osUtil";
import { readXlsx } from "../utils/xlsxUtil";
import { Web } from "./Web";

/**
 * 初始化程序
 * @param params
 */
export function init(params: any) {
  const options = new InitOptions().parse(params);
  const {
    port,
    key,
    sourcePath: sourcePath,
    targetPath,
    web,
    head,
    filter,
    includeColumns,
  } = options;
  const sourceData = readXlsx<{}>(sourcePath);
  // 校验 key 是否重复
  options.validate(sourceData, sourcePath);

  const targetData = readXlsx<{}>(targetPath);
  // 校验 key 是否重复
  options.validate(targetData, targetPath);

  options.initDisplayColumns(sourceData[0]);
  const sourceRows = options.pickProps(sourceData);
  const targetRows = options.pickProps(targetData);
  //  用包含的列数据拼接为对比字串
  const cmp = new Comparator((item: any) => item[key]);
  // 对比表格差异
  const res = cmp.compare(
    (item: any) =>
      includeColumns.reduce((res, cur) => `${res}|${item[cur]}`, ""),
    sourceRows,
    targetRows
  );

  // 去除相同的行及列
  const htm = makeHtml(
    res.sort((a, b) => a.index - b.index),
    options
  );
  // console.dir(htm);

  // 保存主页
  saveSync("bin/client/main.html", htm.toString());

  // 初始化页面资源
  const root = initWebDir("bin/client");

  // 启动 web 服务器
  if (web) {
    new Web(root, Number(port), () =>
      openUrl(`http://localhost:${port}/main.html`)
    );
  }
}

/**
 * 初始化 web 目录
 */
function initWebDir(dir: string): string {
  //
  copySync("src/client/css/comparer.css", `${dir}/css/comparer.css`);
  return dir;
}

/**
 * 创建结果回显页面
 * @param compareResult 源文件行数据
 * @param targetRows 目标文件行数据
 * @param res
 * @param key 表格主键
 * @returns
 */
function makeHtml<T extends Record<string, string>>(
  compareResult: ICompareResult<T>[],
  options: InitOptions
): HTML {
  return html("Xlsx Comparer")
    .append(link("./css/comparer.css"))
    .append(
      div()
        .setClass("main")
        // 图例说明
        .append(
          div()
            .setClass("intro")
            .append(span("Xlsx Comparer").setClass("app-name"))
            .append(span(options.version).setClass("app-ver"))
            .append(makeStatusBox(options))
            .append(span("相同"))
            .append(span("不同").setClass("diff"))
        )
        // 对比表格
        .append(
          div()
            .setClass("pane")
            .append(
              div([
                div(options.sourcePath).appendClass("file-path"),
                makeTableWithResult(compareResult, 0, options, getDiffStyle),
              ])
            )
            .append(
              div([
                div(options.targetPath).appendClass("file-path"),
                makeTableWithResult(compareResult, 1, options, getDiffStyle),
              ])
            )
        )
    );
}

/**
 * 获取不同项的样式
 */
function getDiffStyle<T extends Record<string, string>>(
  res: ICompareResult<T>,
  prop?: string
): string {
  const { diff, values } = res;
  if (!diff) return "";
  if (prop === undefined) return "diff";

  let v: string | null = null;
  for (let val of values) {
    if (val === undefined) continue;
    if (v === null) v = val[prop];
    if (val[prop] !== v) return "diff red";
  }
  return "diff";
}

type ColumnValue = string | ((row: any) => string);

class TableHeader {
  protected _dict: Record<string, string> = {};

  set(col: string, val: string, separator = "/"): this {
    if (!this._dict[col]) {
      this._dict[col] = val;
    } else {
      this._dict[col] += `${separator}${val}`;
    }
    return this;
  }

  get(col: string): string {
    return this._dict[col] ?? "";
  }
}

/**
 * 创建显示结果的表格
 * @param data 表格内容数据
 * @param key 表格主键
 * @param options 配置
 * @param eachFn 每列数据的样式
 * @param indents
 * @returns
 */
function makeTableWithResult<T>(
  data: ICompareResult<T>[],
  tableIndex: number,
  options: InitOptions,
  eachFn: (row: ICompareResult<T>, prop?: string) => string,
  indents: string = ""
): IHTMLContainer {
  const { key, head } = options;
  const rowsHead = head;
  let tbody: IHTMLElement[] = [];
  const ind = new Indent(indents);

  // 添加表头
  const tableHeadRows: IHTMLContainer[] = [];
  const header = new TableHeader();
  const cols = options.displayColumns;
  for (let rowIndex = 0; rowIndex < rowsHead; rowIndex++) {
    const headRowData = data[rowIndex].values[tableIndex] as Record<
      string,
      any
    >;
    cols.forEach((col, colIndex) => {
      const cell = headRowData?.[col] ?? "";
      const tableHeader = th(cell.toString()).setAttribute(
        "title",
        cell.toString(),
        true
      );
      header.set(col, cell.toString());
      if (col === key) tableHeader.appendClass("key");
      if (!tableHeadRows[rowIndex]) tableHeadRows[rowIndex] = tr();
      // 判断是否合并行 TODO
      if (cell === undefined || cell === "" || cell === null) {
        // console.log(`-------`, rowIndex, colIndex, col, headRowData, tableHeadRows[0].getChildAt(colIndex));
        tableHeadRows[0]
          .getChildAt(colIndex)
          ?.setAttribute("rowspan", (rowIndex + 1).toString());
      } else {
        tableHeadRows[rowIndex].append(tableHeader);
      }
    });
  }

  // 表格内容
  ind.reduce();
  for (let i = rowsHead; i < data.length; i++) {
    const res = data[i];

    // 不显示相同的行
    if (options.filter && !res.diff) continue;

    const rowData: Record<string, string> =
      res.values[tableIndex] ?? ({} as Record<string, string>);
    let row: IHTMLElement[] = [];
    const rank = rowData.$rank;

    // 如果是不同项，添加样式
    let prop = "";
    let cls = eachFn && eachFn(res);
    // 添加序号
    row.push(td(rank ?? "").setClass(`${cls ?? ""} rank`));

    for (let j = 1; j < cols.length; j++) {
      prop = cols[j];
      // 获取指定单元格样式
      cls = eachFn && eachFn(res, prop);
      const cell = rowData[prop] ?? "";

      row.push(
        td(cell.toString())
          .appendClass(cls ?? "")
          .appendClass(prop === key ? "key" : "")
          .setAttribute(
            "title",
            `${cell.toString()} 【${header.get(prop)}】`,
            true
          )
      );
    }
    tbody.push(tr(row, ind.add().toString()));
    ind.reduce();
  }
  return table(tbody, ind.toString()).head().appendAll(tableHeadRows)
    .parent as IHTMLContainer;
}

/**
 * 创建状态盒子
 * @param options
 * @returns
 */
function makeStatusBox(options: InitOptions): IHTMLElement {
  const children: IHTMLElement[] = [];
  if (options.key)
    children.push(
      span("主")
        .setAttribute("title", `(-k)主键:${options.key}`)
        .setClass("status-button")
    );
  if (options.key)
    children.push(
      span("头")
        .setAttribute("title", `(-h)表头行数:${options.head}`)
        .setClass("status-button")
    );
  if (options.filter)
    children.push(
      span("滤")
        .setAttribute("title", "(-f)过滤模式：相同的行被隐藏")
        .setClass("status-button")
    );
  if (options.includeColumns.length > 0)
    children.push(
      span("含")
        .setAttribute("title", `(-i)包含这些列:${options.includeColumns}`)
        .setClass("status-button")
    );
  if (options.excludeColumns.length > 0)
    children.push(
      span("除")
        .setAttribute("title", `(-e)除了这些列:${options.excludeColumns}`)
        .setClass("status-button")
    );
  if (options.autoHideSameColumns)
    children.push(
      span("自")
        .setAttribute("title", `自动隐藏没有差异的列:${options.includeColumns}`)
        .setClass("status-button")
    );

  return span(children).setClass("status-box");
}
