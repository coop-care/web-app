import { Base64 } from "js-base64";
import { exportFile, Platform } from "quasar";

export function downloadJSON(data: any, filename: string, pretty = false) {
    const json = JSON.stringify(data, undefined, pretty ? 2 : undefined);
    const exportFilename = encodeURIComponent(filename);

    if (Platform.is.cordova) {
        // string can contain utf-8 characters longer than one byte which causes errors in btoa which works with ASCII characters
        const jsonUri = `df:${exportFilename};data:application/json;base64,${Base64.encode(json)}`;
        window.plugins?.socialsharing?.shareWithOptions({
            subject: filename, 
            files: [jsonUri]
        });
    } else {
        const mimeType = "application/json;charset=utf-8";
        const byteOrderMark = "\uFEFF";
        return exportFile(exportFilename, json, { mimeType, byteOrderMark });
    }
}
