import { exportFile } from "quasar";

export function downloadJSON(data: any, filename: string, pretty = false) {
    const json = JSON.stringify(data, undefined, pretty ? 2 : undefined);
    const exportFileDefaultName = encodeURIComponent(filename);
    const mimeType = "charset=utf-8";
    return exportFile(exportFileDefaultName, json, { mimeType });
}
