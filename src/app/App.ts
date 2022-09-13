import express from 'express';
import { Server } from 'http';

export class Web {
    app!: Server;
    constructor(root: string, port = 8100, callback?: Function) {
        this.app = express()
            .use(express.static(root)).listen(port, () => {
                console.log(`-> web on http://localhost:${8100}`);
                if (callback) callback();
            });
    }
}