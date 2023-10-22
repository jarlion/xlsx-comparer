import { exec, spawn } from "child_process";
import {
  WriteFileOptions,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { dirname, resolve } from "path";

/**
 * 列出目录下文件列表
 * @param dir
 * @returns
 */
export function list(dir: string): string[] {
  if (!dir) return [];
  try {
    const path = resolve(dir);
    if (existsSync(dir)) {
      return readdirSync(path);
    }
  } catch (err) {
    console.error(err);
    return [];
  }
  return [];
}

/**
 * 列出遍历目录下所有文件
 * @param dir
 * @returns
 */
export function each(
  dir: string,
  callback: (filePath: string, fileName: string) => void,
  suffix: RegExp = /.$/,
  childrenDir: boolean = true
): void {
  if (!dir) return;
  try {
    const path = resolve(dir);
    if (existsSync(dir)) {
      const list = readdirSync(path);
      // 深度优先
      for (const fileName of list) {
        const filePath = resolve(path, fileName);
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
          if (childrenDir) {
            each(filePath, callback, suffix, childrenDir);
          }
        }
        if (suffix.test(fileName)) callback(filePath, fileName);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * 删除目录下所有文件
 * @param dir 指定的目录
 * @returns
 */
export function clearSync(dir: string): void {
  if (!dir) return console.error(new Error("!!! 无法执行清理 参数错误!"));
  const path = resolve(dir);
  if (!existsSync(path)) return console.error(new Error("!!! 找不到路径!"));
  const list = readdirSync(path);
  list.forEach((fileName) => {
    const filePath = resolve(path, fileName);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      clearSync(filePath);
      rmdirSync(path);
    } else {
      unlinkSync(filePath);
    }
  });
  console.log(`-> 目标清理完毕! ${path}`);
}

/**
 * 保存文件
 * @param path 文件路径
 * @param data 文件内容
 * @param options 保存选项
 */
export function saveSync(
  path: string,
  data: string,
  options: WriteFileOptions = { encoding: "utf-8" }
): void {
  try {
    const filePath = resolve(process.cwd(), path);
    dirSync(filePath);
    writeFileSync(filePath, data, options);
    console.log(`-> 文件保存成功！${filePath}`);
  } catch (err) {
    console.log(err);
  }
}

/**
 * 使用浏览器打开链接
 * @param url
 */
export function openUrl(url: string): void {
  // 判断平台
  switch (process.platform) {
    // Mac 使用open
    case "darwin":
      spawn("open", [url]);
      break;
    // Windows使用start
    case "win32":
      exec(`start ${url}`);
      // TODO 环境变量缺少 system32/
      // console.log(process.env.PATH);
      // spawn('start', [url]).on('error', function (err) { console.error(`!!! ${err.stack}`); });
      break;
    // Linux等使用xdg-open
    default:
      spawn("xdg-open", [url]);
  }
}

export function dirSync(path: string, create: boolean = true): string {
  const dirPath = dirname(path);
  if (!existsSync(dirPath)) create ? mkdirSync(dirPath) : ""; // TODO
  return dirPath;
}

export function copySync(src: string, dist: string): void {
  try {
    const srcFullPath = resolve(process.cwd(), src);
    const distFullPath = resolve(process.cwd(), dist);
    // writeFileSync(readFileSync(src), dist);
    dirSync(distFullPath);
    copyFileSync(srcFullPath, distFullPath);
  } catch (err) {
    console.error(err);
  }
}
