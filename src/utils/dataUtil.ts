/**
 * 是否关键想重复了
 * @param items 检查的数据
 * @param key
 * @returns
 */
export function isKeyDuplication<I>(items: I[], key: any): number {
  const map: Record<string, any> = {};
  const set: Set<any> = new Set();
  for (let index = 0; index < items.length; index++) {
    const element = items[index];
    // type K =P in keyof T
    // @ts-ignore
    if (set.has(element[key])) {
      return index;
    }
    // @ts-ignore
    set.add(element[key]);
  }
  return -1;
}

/**
 * 对比结果
 */
export interface ICompareResult<T> {
  /** 比较的键 */
  key: string;
  /** 用于排序的值 */
  index: number;
  /** 快速比较的值 */
  cmpVal: any;
  diff: boolean;
  /** 每行源数据 */
  values: T[];
}

/**
 * 对比器
 * 支持多个数组对比
 */
export class Comparator<T> {
  /**
   * 构造子
   * @param getKey 获取关键属性
   */
  constructor(protected getKey: (item: T) => string) {}

  /**
   * 比较数据
   * @param calcValue 计算对比值
   * @param arr 需要对比的数据数据
   * @returns 对比结果
   */
  compare(calcValue: (item: T) => any, ...arr: T[][]): ICompareResult<T>[] {
    let result: ICompareResult<T>[] = [];
    const dict: Record<string, ICompareResult<T>> = {};
    const len = arr.length;
    for (let col = 0; col < len; col++) {
      for (let row = 0; row < arr[col].length; row++) {
        const item = arr[col][row];
        const key = this.getKey(item);
        if (!dict[key]) {
          const values: T[] = [];
          values[col] = item;
          dict[key] = {
            key,
            index: row * len + col,
            cmpVal: calcValue(item),
            diff: true,
            values,
          };
          result.push(dict[key]);
        } else {
          dict[key].diff &&= dict[key].cmpVal !== calcValue(item);
          dict[key].values[col] = item;
        }
      }
    }
    return result;
  }
}

/**
 * 字符串转数组
 * @param str
 * @returns
 */
export function str2arr(str: string): string[] {
  if (!str) return [];
  return str.split(",").filter((s) => s.trim() !== "");
}

/**
 * 从指定对象获取值到目标对象
 * @param object 指定对象
 * @param props 需要摘取的属性
 * @param target 返回的目标对象
 * @returns
 */
export function pick(object: any, props: string[], target: any): any {
  for (const key in object) {
    if (
      Object.prototype.hasOwnProperty.call(object, key) &&
      props.includes(key)
    ) {
      target[key] = object[key];
    }
  }
  return target;
}
