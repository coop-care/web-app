export function download(filename: string, dataUri: string) {
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", filename);
    linkElement.click();
}

export function downloadJSON(data: any, filename: string) {
    const json = JSON.stringify(
        data,
        (key, value) => {
            if (key == "_id") {
                return Array.prototype.map.call(new Uint8Array(value.id), x => ("00" + x.toString(16)).slice(-2)).join("");
            } else {
                return value;
            }
        },
        2
    );
    const jsonUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(json);
    const exportFileDefaultName = encodeURIComponent(filename);
    download(exportFileDefaultName, jsonUri);
}
