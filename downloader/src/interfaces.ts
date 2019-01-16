export interface IPCData {
    files: Array<string | ManifestLine>
    features: Array<string>
    inSeparator: string;
    outSeparator: string;
}

export interface IPCMessage {
    worker: string;
    name: string;
    content?: any;
}

export interface ManifestLine {
    uuid: string;
    fname: string;
    type: string;
}