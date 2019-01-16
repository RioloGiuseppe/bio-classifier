import { IPCData, IPCMessage, ManifestLine } from "./interfaces";
import { FileDownloader } from "./file-downloader";
import { resolve } from 'path'
import 'colors'
process.on("message", async (ipc: IPCData) => {
    for (let f of ipc.files) {
        f = f as ManifestLine;
        try {
            process.send({ worker: process.argv[2], name: "ST", content: `${`Worker ${process.argv[2]}`.green} is processing file ${f.fname.cyan}` } as IPCMessage)
            process.send({ worker: process.argv[2], name: "RF", content: `${`Worker ${process.argv[2]}`.green} is downloading file ${f.fname.cyan}` } as IPCMessage)
            await FileDownloader.download(f.uuid, process.argv[3], f.fname);
            process.send({ worker: process.argv[2], name: "RF", content: `${`Worker ${process.argv[2]}`.green} is extracting file ${f.fname.cyan}` } as IPCMessage)
            await FileDownloader.unzip(process.argv[3] + "/" + f.fname, resolve(process.argv[3]));
            FileDownloader.setStatus(process.argv[3] + "/" + f.fname.replace('.gz', ""), f.type);
        } catch (e) {
            console.log(e)
        }
    }
    process.send({ worker: process.argv[2], name: "EX", content: `${`Worker ${process.argv[2]}`.green} exit` } as IPCMessage);
    process.exit(0);
});

