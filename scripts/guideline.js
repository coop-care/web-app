const { readFile } = require("fs").promises;
const { existsSync } = require("fs");

const category = 0;
const target = 1;
const terminologyfile = "src/i18n/en-us/terminology.json";

const filepath = process.argv[2];
const details = parseInt(process.argv[3]) || 2;

if (!filepath) {
  console.error("🚫 missing argument 1: path to CSV file")
  process.exit(1);
}

if (!existsSync(filepath)) {
  console.error("🚫 CSV file not found:", filepath);
  process.exit(2);
}

if (!existsSync(terminologyfile)) {
  console.error("🚫 terminology file not found:", terminologyfile);
  process.exit(3);
}


(async () => {
  try {
    const terminology = JSON.parse(await readFile(terminologyfile, "utf-8"));
    const categoryCodes = Object.entries(terminology.interventionScheme.categories)
      .reduce((result, [key, item]) => {
        result[item.title] = key;
        return result;
      }, {});
    const targetCodes = Object.entries(terminology.interventionScheme.targets)
      .reduce((result, [key, item]) => {
        result[item.title] = key;
        return result;
      }, {});
    targetCodes["end of life care"] = "68";

    const csv = await readFile(filepath, "utf-8");
    const data = csv.split("\n")
      .map(row => row.replace(/^"/, "").replace(/"$/, "").replace(/,$/, ",\"").split("\",\""))
      .reduce((result, row) => {
        const categoryCode = categoryCodes[row[category].trim().replace(/  +/g, " ")] || row[category];
        const targetCode = targetCodes[row[target].trim().replace(/  +/g, " ")] || row[target];
        result[categoryCode] = result[categoryCode] || {};
        result[categoryCode][targetCode] = (result[categoryCode][targetCode] || [])
          .concat(row[details] || "");
        return result;
      }, {});

    console.log(JSON.stringify(data, undefined, 2));

  } catch (error) {
    console.error("🚫 Aborted processing because an error occured:");
    console.error(error);
  }
})();
