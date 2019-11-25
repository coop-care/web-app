export module Download {
  export function ts(data: any, filename: string) {
    let json = JSON.stringify(
      data,
      (key, value) => {
        if (["title", "description", "titles", "descriptions"].includes(key)) {
          return undefined;
        }
        if (value === undefined) {
          return null;
        }
        return value;
      },
      2
    );
    json = json
      .replace(/At\": (\".+\")/g, 'At": new Date($1)')
      .replace(/\": null/g, '": undefined')
      .replace(/\"(.+)\":/g, "$1:")
      .replace(/assessment: \[\]/g, "assessment: [] as Store.Note[]")
      .replace(/^\]$/m, "] as Store.Customer[];\n")
      .replace(
        /^\[$/m,
        'import * as Store from "../store/index";\n\nexport default ['
      );
    let jsonUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(json);
    let exportFileDefaultName = encodeURIComponent(filename);
    generic(exportFileDefaultName, jsonUri);
  }

  export function generic(filename: string, dataUri: string) {
    let linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", filename);
    linkElement.click();
  }
}
