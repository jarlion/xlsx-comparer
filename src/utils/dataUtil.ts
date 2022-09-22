
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

export function compare<I extends Record<string, any>>(source: I[], target: I[], key: string, startIndex: number = 0,
    equalFn: (sourceItem: I, targetItem: I, p: string) => boolean = (s, t, p) => s[p] !== t[p]): CompareResult {
    const result: CompareResult = new CompareResult;
    for (let index = startIndex; index < source.length; index++) {
        let sourceItem = source[index];
        const mainKey = sourceItem[key];
        const targetItemIndex = target.findIndex((i: Record<string, any>) => i[key] === mainKey);
        if (targetItemIndex !== -1) {
            result.old(index);
            result.link(targetItemIndex, index);
            const targetItem = target[targetItemIndex];
            const props = Object.keys(targetItem);
            // 是否相同的行
            let same = true;
            props.forEach(p => {
                // 找到不同属性写入结果
                // @ts-ignore
                if (!equalFn(sourceItem, targetItem, p)) {
                    result.diff(p, index);
                    same = false;
                }
            });
            if (same) result.same.add(mainKey);
        }
        else {
            result.del(index);
        }
    }
    return result;
}

export class CompareResult {
    duplicationProps: Set<any> = new Set();
    /** 相同的数据[主键] */
    same: Set<string> = new Set();
    protected _differentDict: Record<string, { [index: number]: boolean; }> = {};
    protected _oldIndex: Set<number> = new Set();
    protected _deletedIndex: Set<number> = new Set();
    protected _links: Record<number, number> = {};

    diff(prop: string, index: number): this {
        this.duplicationProps.add(prop);
        if (!this._differentDict[prop]) this._differentDict[prop] = {};
        this._differentDict[prop][index] = true;
        return this;
    }
    idDiff(prop: string, index: number): boolean {
        // console.log(prop, index, this._differentDict[prop] && this._differentDict[prop][index]);
        return this._differentDict[prop] && this._differentDict[prop][index];
    }

    isSame = (key: string) => (item: { [a: string]: string; }): boolean =>
        !this.same.has(item[key]);

    getLink(targetIndex: number): number {
        return this._links[targetIndex] ?? -1;
    }

    isNew(index: number): boolean {
        return !this._oldIndex.has(index);
    }
    old(index: number): this {
        this._oldIndex.add(index);
        return this;
    }
    del(index: number): this {
        this._deletedIndex.add(index);
        return this;
    }

    link(targetIndex: number, sourceIndex: number): this {
        this._links[targetIndex] = sourceIndex;
        return this;
    }
}

/**
 * 字符串转数组
 * @param str 
 * @returns 
 */
export function str2arr(str: string): string[] {
    if (!str) return [];
    return str.split(',').filter(s => s.trim() !== '');
}

export function pick(object: any, props: string[], target: any): any {
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key) && props.includes(key)) {
            target[key] = object[key];
        }
    }
    return target;
}