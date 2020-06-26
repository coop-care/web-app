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
            if (["_id", "user_id"].includes(key)) {
                return undefined;
            }
            return value;
        },
        2
    );
    const jsonUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(json);
    const exportFileDefaultName = encodeURIComponent(filename);
    download(exportFileDefaultName, jsonUri);
}
