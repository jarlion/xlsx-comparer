import express from 'express';
import { Server } from 'http';

/**
 * 网页服务器
 * 用于回显对比结果
 */
export class Web {
    app!: Server;
    constructor(root: string, port = 8100, callback?: Function) {
        this.app = express()
            .use(express.static(root)).listen(port, () => {
                console.log(`-> web on http://localhost:${port}`);
                if (callback) callback();
            });
    }
}