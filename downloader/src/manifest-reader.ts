import { EventEmitter } from "events";
import { ManifestLine } from "./interfaces";
const lbl = require('line-by-line');

export class ManifestReader extends EventEmitter {

    private _files: Array<ManifestLine>
    private _body: boolean;
    constructor() {
        super();
        this._files = [];
        this._body = false
    }

    public readManifest(name: string): Promise<Array<ManifestLine>> {
        return new Promise((resolve, reject) => {
            let lr = new lbl(name);
            lr.on('error', (err) => reject(err));
            lr.on('line', (line: string) => {
                if (this._body) {
                    let _l = line.split("\t");
                    this._files.push({
                        uuid: _l[0],
                        fname: _l[1],
                        type: _l[7]
                    } as ManifestLine);
                } else {
                    this._body = true;
                }
            });
            lr.on('end', () => {
                resolve(this._files);
                this.emit('end', this._files);
                this._files = [];
            });
        });
    }
}