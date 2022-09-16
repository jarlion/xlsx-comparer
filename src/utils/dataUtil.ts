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

export function compare<I extends object>(source: I[], target: I[], key: string): CompareResult {
    const result: CompareResult = new CompareResult;
    for (let index = 0; index < source.length; index++) {
        let sourceItem = source[index];
        // for (let item of a) {
        // @ts-ignore
        const targetItemIndex = target.findIndex(i => i[key] === sourceItem[key]);
        if (targetItemIndex !== -1) {
            result.old(index);
            result.link(targetItemIndex, index);
            const targetItem = target[targetItemIndex];
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