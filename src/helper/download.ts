export function download(filename: string, dataUri: string) {
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", filename);
    linkElement.click();
}

export function downloadJSON(data: any, filename: string, pretty = false) {
    const json = JSON.stringify(data, undefined, pretty ? 2 : undefined);
    const jsonUri = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    const exportFileDefaultName = encodeURIComponent(filename);
    download(exportFileDefaultName, jsonUri);
}
