const DraftLog = require('draftlog');
import { fork, ChildProcess, execSync } from 'child_process'
import { IPCData, IPCMessage } from "./interfaces";
import { existsSync, mkdirSync } from "fs";
import { platform, EOL, cpus } from 'os'
import { ManifestReader } from "./manifest-reader";
export class Program {
    private static _worker = 0;
    private static _folder = "../data/files"
    private static workers_d: Array<ChildProcess> = [];
    private static _consoleLines: Array<(text: string) => void> = [];
    private static _percentage: (text: string) => void;
    private static _percData: { total: number, current: number } = { current: 0, total: 0 };
    public static async main() {
        if (!existsSync(this._folder))
            mkdirSync(this._folder);

        this._worker = this.getCores() + 1;
        DraftLog(console);
        let files = await (new ManifestReader()).readManifest('../data/gdc_sample_sheet.2019-01-15.tsv');
        let dwnAlive: number = this._worker;
        let _files = this.chunkArray(files, Math.ceil(files.length / this._worker));
        this._percData.total = files.length;
        for (let i: number = 0; i < this._worker; i++) {
            this.workers_d.push(fork('build/worker.js', ["" + (i + 1), this._folder]));
        }

        for (let i: number = 0; i < this._worker; i++)
            this._consoleLines.push((<any>console).draft(""));
        this._percentage = (<any>console).draft("");
        for (let i: number = 0; i < this.workers_d.length; i++) {
            this.workers_d[i].send({ files: _files[i] } as IPCData);
            this.workers_d[i].on("message", (message: IPCMessage) => {
                if (message.name === "ST") {
                    this._percData.current++;
                }
                if (message.name === "EX") {
                    dwnAlive--;
                    if (dwnAlive === 0) {
                        console.log("Download completed!");
                    }
                }
                if (message.name === "RF") {
                    this._percentage(`Processed ${this._percData.current} of ${this._percData.total} (${(this._percData.current / this._percData.total * 100).toFixed(2)}%)`)
                    this._consoleLines[parseInt(message.worker) - 1](message.content);
                }
            });
        }
    }
    private static chunkArray(myArray: Array<any>, chunk_size: number) {
        let index = 0;
        let arrayLength = myArray.length;
        let tempArray = [];
        for (index = 0; index < arrayLength; index += chunk_size) {
            let myChunk = myArray.slice(index, index + chunk_size);
            tempArray.push(myChunk);
        }
        return tempArray;
    }

    private static getCores(): number {
        if (platform() === 'linux') {
            const output = execSync('lscpu -p | egrep -v "^#" | sort -u -t, -k 2,4 | wc -l', { encoding: 'utf8' });
            return parseInt(output.trim(), 10)
        } else if (platform() === 'darwin') {
            const output = execSync('sysctl -n hw.physicalcpu_max', { encoding: 'utf8' });
            return parseInt(output.trim(), 10)
        } else if (platform() === 'win32') {
            const output = execSync('WMIC CPU Get NumberOfCores', { encoding: 'utf8' });
            return output.split(EOL)
                .map(function parse(line) { return parseInt(line) })
                .filter(function numbers(value) { return !isNaN(value) })
                .reduce(function add(sum, number) { return sum + number }, 0)
        } else {
            const cores = cpus().filter(function (cpu, index) {
                const hasHyperthreading = cpu.model.includes('Intel')
                const isOdd = index % 2 === 1
                return !hasHyperthreading || isOdd
            })
            return cores.length
        }
    }
}

Program.main();