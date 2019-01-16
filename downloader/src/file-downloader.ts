import { get } from 'https'
import { createWriteStream, createReadStream, rename, unlink, unlinkSync } from 'fs'
var download = require('download-file');
const inly = require('inly');

export class FileDownloader {
    public static download(uuid: string, directory: string, filename: string) {
        return new Promise((resolve, reject) => {
            download(`https://api.gdc.cancer.gov/data/${uuid}`, { directory, filename }, (err) => {
                if (err) reject(err)
                else
                    resolve();
            })
        });
    }

    public static async unzip(fname: string, dir: string) {
        return new Promise((resolve, reject) => {
            const extract = inly(fname, dir);
            extract.on('end', () => {
                resolve();
                unlinkSync(fname);
            });
        });
    }

    public static setStatus(fname: string, status: string) {
        return new Promise((resolve, reject) => {
            rename(fname, `${fname.replace(".txt", "")}.${status}.txt`, function (err) {
                if (err)
                    reject();
                else
                    resolve();
            });
        })
    }
}