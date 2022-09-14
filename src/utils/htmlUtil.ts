
export function createHtml(body: string): string {
    return `
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <link rel="stylesheet" href="./css/comparer.css" type="text/css" />
    </head>
    <body>
        ${body}
    </body>
</html>`;
}

export type IHtmlChildren = IHTMLElement | IHTMLElement[] | string | null;

export function html(child: IHTMLElement): IHTMLElement {
    return new HtmlContainer('html', child).setComment('<!doctype html>');
}

export function makeTable<T extends Record<string, string>>(data: T[], eachFn: (colName: string, row: number) => string, indents: string = ''): HtmlContainer {
    let tbody: IHTMLElement[] = [];
    const ind = new Indent(indents);

    const cols = Object.keys(data[0]);
    const head: IHTMLElement[] = [th()];
    cols.forEach(h => head.push(th(h)));
    tbody.push(tr(head, ind.add().toString()));

    ind.reduce();
    for (let i = 1; i < data.length; i++) {
        let row: IHTMLElement[] = [];

        // 如果是不同项，添加样式
        let prop = '';
        const cls = eachFn && eachFn(prop, i);
        // 添加序号
        row.push(td(i).setClass(cls ? cls + ' index' : 'index'));

        for (let j = 0; j < cols.length; j++) {
            prop = cols[j];
            // 如果是不同项，添加绿底
            const cls = eachFn && eachFn(prop, i);
            const cell = data[i][prop] ?? '';
            row.push(td(cell).setClass(cls ? cls : ''));
        }
        tbody.push(tr(row, ind.add().toString()));
        ind.reduce();
    }
    return table(tbody, ind.toString()).setId('xl');
}

export function createTable<T extends object>(data: T[], eachFn: (colName: string, row: number) => string, indents: string = ''): string {
    let table = `
${indents}<table id="xl">
${indents}${indents}<tr>`;

    const cols = Object.keys(data[0]);
    table += `<th></th>`; // 序号列
    cols.forEach(h => {
        table += `<th>${h}</th>`;
    });
    table += `${indents}${indents}</tr>`;

    for (let i = 1; i < data.length; i++) {
        table += `${indents}<tr>\n`;
        let row = `${indents}<tr>\n`;

        // 如果是不同项，添加绿底
        let prop = '';
        const cls = eachFn && eachFn(prop, i);
        // 添加序号
        row += `${indents}<td ${cls ? 'class="' + cls + ' index"' : 'index'}>${i}</td>`;

        for (let j = 0; j < cols.length; j++) {
            prop = cols[j];
            // 如果是不同项，添加绿底
            const cls = eachFn && eachFn(prop, i);
            // @ts-ignore
            row += `${indents}<td ${cls ? 'class="' + cls + '"' : ''}>${data[i][prop]}</td>`;

        }
        row += `${indents}</tr>\n`;
        table += row;
        table += `${indents}</tr>\n`;
    }
    table += `${indents}</table>\n`;
    return table;
}

export function div(children: IHtmlChildren, indents: string = ''): HtmlContainer {
    return new HtmlContainer('div', children, indents);
}

export function span(children: IHtmlChildren, indents: string = ''): HtmlContainer {
    return new HtmlContainer('span', children, indents);
}

export function table(children: IHtmlChildren, indents: string = ''): HtmlContainer {
    return new HtmlContainer('table', children, indents);
}
export function tr(children: IHtmlChildren, indents: string = ''): HtmlContainer {
    return new HtmlContainer('tr', children, indents);
}
export function th(children: IHtmlChildren = null, indents: string = ''): HtmlContainer {
    return new HtmlContainer('th', children, indents);
}
export function td(children: IHtmlChildren = null, indents: string = ''): HtmlContainer {
    return new HtmlContainer('td', children, indents);
}

export function img(src: string, indents: string = ''): HTMLImage {
    return new HTMLImage(src, indents);
}

/**
 * 缩进
 */
export class Indent {
    protected _val = '';
    constructor(defaultValue = '', public step = '  ') {
        this._val = defaultValue;
    }

    add(): this {
        this._val += this.step;
        return this;
    }

    reduce(): this {
        this._val = this._val.slice(0, this._val.length - this.step.length);
        return this;
    }

    toString(): string {
        return this._val;
    }
}

export interface IHTMLElement {
    toString(): string;
}

export class HTMLBaseElement implements IHTMLElement {
    protected _comment: string = '';
    protected _id: string = '';
    protected _class: string = '';
    protected _style: string = '';

    constructor(public tag: string, public indents: string = '') { }
    getAttributes(): Record<string, string> {
        return {
            id: this._id,
            className: this._class,
            style: this._style
        };
    }

    setComment(value: string): this {
        this._comment = value;
        return this;
    }

    setId(value: string): this {
        this._id = value;
        return this;
    }

    setClass(value: string): this {
        this._class = value;
        return this;
    }

    setStyle(value: string): this {
        this._style = value;
        return this;
    }

    toString(): string {
        let startTag = this._getStartTag(this.tag);
        return `${this._getIndents()}<${startTag} />`;
    }

    protected _getIndents(): string {
        if (this.indents) return `\n${this.indents}`;
        return '';
    }

    protected _getStartTag(tag: string): string {
        let startTag = tag;
        if (this._id) startTag += ` id="${this._id}"`;
        if (this._class) startTag += ` class="${this._class}"`;
        if (this._style) startTag += ` style="${this._style}"`;
        return startTag;
    }
}

/**
 * HTML 元素模板
 */
export class HtmlContainer extends HTMLBaseElement {
    constructor(tag: string, public child: IHtmlChildren = null, indents: string = '') {
        super(tag, indents);
    }

    toString(): string {
        let startTag = this._getStartTag(this.tag);
        const children = Array.isArray(this.child) ? (this.child as IHTMLElement[]).reduce<IHTMLElement>((p, c) => p + c.toString(), '') : this.child?.toString() ?? '';
        const indents = this._getIndents();
        return `${indents}<${startTag}>${children}${indents}</${this.tag}>`;
    }
}

export class HTMLImage extends HTMLBaseElement {
    constructor(public src: string, indents: string = '') {
        super('img', indents);
    }

    protected _getStartTag(tag: string): string {
        let startTag = super._getStartTag(tag);
        return `${startTag} src=${this.src}`;
    }
}