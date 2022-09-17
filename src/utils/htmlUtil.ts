
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

export function html(title: string = '', lang: string = 'zh-CN'): HTML {
    // return new HtmlContainer('html', child).setComment('<!doctype html>');
    return new HTML(title, lang);
}



export function div(children: IHtmlChildren = null, indents: string = ''): HtmlContainer {
    return new HtmlContainer('div', children, indents);
}

export function span(children: IHtmlChildren = null, indents: string = ''): HtmlContainer {
    return new HtmlContainer('span', children, indents);
}

export function table(children: IHtmlChildren = null, indents: string = ''): HtmlContainer {
    return new HtmlContainer('table', children, indents);
}
export function tr(children: IHtmlChildren = null, indents: string = ''): HtmlContainer {
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

export function link(href: string, type = "text/css", rel = "stylesheet"): HTMLLink {
    return new HTMLLink(href, type, rel);
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
    tag: string;
    parent?: IHTMLElement;
    setAttribute(name: string, value: string, encode?: boolean): this;
    appendAttribute(name: string, value: string, encode?: boolean): this;
    toString(): string;
}

export class HTMLText implements IHTMLElement {
    tag: string = '';
    parent?: IHTMLElement | undefined;
    constructor(public text: string) { }
    setAttribute(name: string, value: string, encode: boolean): this {
        return this;
    };
    appendAttribute(name: string, value: string, encode: boolean): this {
        return this;
    };

    toString(): string {
        return this.text;
    }

}

export function encodeHtml(value: string): string {
    if (!value) return '';
    return String(value).replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/×/g, '&times;')
        .replace(/÷/g, '&divide;')
        .replace(/&/g, '&amp;')
        .replace(/©/g, '&copy;')
        .replace(/®/g, '&reg;')
        .replace(/®/g, '&reg;')
        .replace(/ /g, '&nbsp;') // 不断行的空白格
        .replace(/ /g, '&ensp;')// 半方大的空白
        .replace(/ /g, '&ensp;');// 全方大的空白
}

export class HTMLBaseElement implements IHTMLElement {

    parent?: IHTMLElement = undefined;

    protected _comment: string = '';

    protected _attributes: Record<string, string> = {};

    constructor(public tag: string, public indents: string = '') { }

    setAttribute(name: string, value: string, encode: boolean = false): this {
        const val = String(value).trim() ?? '';
        this._attributes[name] = encode ? encodeHtml(val) : val;
        return this;
    }
    appendAttribute(name: string, value: string, encode: boolean = false): this {
        if (!value) return this;
        const currentAttribute = this._attributes[name];
        this.setAttribute(name, `${currentAttribute ?? ''} ${value}`, encode);
        return this;
    }

    setComment(value: string): this {
        this._comment = value;
        return this;
    }

    setId(value: string): this {
        this.setAttribute('id', value);
        return this;
    }

    appendListener(event: string, methodName: string): this {
        this.setAttribute(event, methodName);
        return this;
    }

    toString(): string {
        const comment = this._comment;
        const startTag = this._getStartTag(this.tag);
        const content = this._formContent();
        const indents = this._getIndents();
        const result = `${comment}\n${indents}`;
        if (content === '') return `${result}<${startTag} />`;

        return `${result}<${startTag}>${content}</${this.tag}>`;
    }

    protected _getIndents(): string {
        if (this.indents) return `\n${this.indents}`;
        return '';
    }

    protected _getStartTag(tag: string): string {
        let startTag = tag;
        startTag += this._formatAttribute();
        return startTag;
    }

    protected _formatAttribute(): string {
        let attrs = '';
        for (const name in this._attributes) {
            attrs += ` ${name}="${this._attributes[name]}"`;
        }
        return attrs;
    }

    protected _formContent(): string {
        return '';
    }
}

export class HtmlStyleElement extends HTMLBaseElement {
    setClass(value: string): this {
        return this.setAttribute('class', value);
    }

    appendClass(value: string): this {
        return this.appendAttribute('class', value);
    }

    setStyle(value: string): this {
        return this.setAttribute('style', value);
    }
    appendStyle(value: string): this {
        return this.appendAttribute('style', value);
    }
}

/**
 * HTML 元素模板
 */
export class HtmlContainer extends HtmlStyleElement {
    protected _children: IHTMLElement[] = [];
    constructor(tag: string, child: IHtmlChildren = null, indents: string = '') {
        super(tag, indents);
        if (typeof child === 'string') {
            this._children.push(new HTMLText(child));
        }
        else if (Array.isArray(child)) {
            this._children.push(...child);
        }
        else {
            if (child !== null) this._children.push(child);
        }
    }

    append(child: IHTMLElement, index = -1): this {
        if (!child) return this;
        child.parent = this;
        let start = index >= 0 ? index : this._children.length + index + 1;
        this._children.splice(start, 0, child);
        return this;
    }

    protected _formContent(): string {
        const content = this._children.reduce((p, c) => p + c.toString(), '');
        return content;
    }

}

export class HTMLMeta extends HTMLBaseElement {
    constructor(name: string = '', content = '', charset = "utf-8") {
        super('meta');
        this.setAttribute('charset', charset)
            .setAttribute('name', name)
            .setAttribute('content', content);
    }
}
export class HTMLLink extends HTMLBaseElement {
    constructor(href: string, type = "text/css", rel = "stylesheet") {
        super('link');
        this.setAttribute('href', href)
            .setAttribute('type', type)
            .setAttribute('rel', rel);
    }
}

export class HTML extends HtmlContainer {
    constructor(title: string = '', lang: string = 'zh-CN') {
        super('html', [
            new HtmlContainer('head')
                .append(new HTMLMeta('', '', 'utf-8'))
                .append(new HTMContent('title', title)),
            new HtmlContainer('body')]);
        this.setAttribute('lang', lang)
            .setComment('<!DOCTYPE html>');
    }

    head(): HtmlContainer {
        return this._children[0] as HtmlContainer;
    }
    body(): HtmlContainer {
        return this._children[1] as HtmlContainer;
    }

    append(child: IHTMLElement, index: number = -1): this {
        if (['link', 'meta', 'title'].includes(child.tag)) {
            this.head().append(child, index);
        }
        else {
            this.body().append(child, index);
        }
        return this;
    }
}

export class HTMLImage extends HTMLBaseElement {
    constructor(src: string, indents: string = '') {
        super('img', indents);
        this.setAttribute('src', src);
    }
}

export class HTMContent extends HTMLBaseElement {
    constructor(tag: string, protected _content: string, indents: string = '') {
        super(tag, indents);
    }

    protected _formContent(): string {
        return this._content;
    }
}

export class HTMScript extends HTMContent {
    constructor(content: string, type = 'text/javascript', indents: string = '') {
        super('script', content, indents);
        this.setAttribute('type', type);
    }
}