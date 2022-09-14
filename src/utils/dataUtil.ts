import { type } from "os";


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

export function compare<I>(a: I[], b: I[], key): CompareResult {
    const result: CompareResult = new CompareResult;
    for (let index = 0; index < a.length; index++) {
        let sourceItem = a[index];
        // for (let item of a) {
        // @ts-ignore
        const targetItem = b.find(i => i[key] === sourceItem[key]);
        if (targetItem) {
            result.old(index);
            const props = Object.keys(targetItem);
            props.forEach(p => {
                // 找到不同属性写入结果
                // @ts-ignore
                if (sourceItem[p] !== targetItem[p]) {
                    result.diff(p, index);
                }
            });
        }
        else {
            result.del(index);
        }
    }
    return result;
}

export class CompareResult {
    duplicationProps: Set<any> = new Set();
    protected _differentDict: Record<string, { [index: number]: boolean; }> = {};
    protected _oldIndex: Set<number> = new Set();
    protected _deletedIndex: Set<number> = new Set();

    diff(prop: string, index: number) {
        this.duplicationProps.add(prop);
        if (!this._differentDict[prop]) this._differentDict[prop] = {};
        this._differentDict[prop][index] = true;
    }
    idDiff(prop: string, index: number): boolean {
        // console.log(prop, index, this._differentDict[prop] && this._differentDict[prop][index]);
        return this._differentDict[prop] && this._differentDict[prop][index];
    }

    isNew(index: number) {
        return !this._oldIndex.has(index);
    }
    old(index: number) {
        this._oldIndex.add(index);
    }
    del(index: number) {
        this._deletedIndex.add(index);
    }
}