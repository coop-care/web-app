import { colors } from "quasar";

const { getBrand, setBrand, lighten } = colors;

export function getColor(name: string) {
    return getBrand(name);
}

export function setColor(name: string, value: string) {
    setBrand(name, value);
    setBrand(
        name + "-gd",
        "linear-gradient(" +
        lighten(value, 10) +
        ", " +
        lighten(value, -5) +
        ")"
    );
    setBrand(name + "-bg", lighten(value, 97));

    if (name == "primary") {
        setBrand(name + "-chat", lighten(value, 86));
        setBrand(name + "-chat-bg", `linear-gradient(${lighten(value, 96)}, ${lighten(value, 86)})`);
    }
}

export function setColorSet(colors: string[]) {
    if (colors.length >= 4) {
        setColor("primary", colors[0]);
        setColor("classification", colors[1]);
        setColor("intervention", colors[2]);
        setColor("outcome", colors[3]);
    }
    if (colors.length >= 5) {
        setColor("negative", colors[4]);
    } else {
        setColor("negative", "#C10015");
    }
    if (colors.length >= 6) {
        setColor("positive", colors[5]);
    } else {
        setColor("positive", "#21BA45");
    }
}

// value at index 0 is unique, values at indices 1 - 5 are apple system colors:
// https://developer.apple.com/design/human-interface-guidelines/macos/visual-design/color/
export const defaultColors = [
    "#960372",
    "#FF2C55",
    "#FF9500",
    "#AF52DE",
    "#ff3b30",
    "#28CD41"
];

export const chartColors = {
    "blue": "rgb(0, 122, 255)",
    "brown": "rgb(172, 142, 104)",
    "gray": "rgb(152, 152, 157)",
    "green": "rgb(50, 215, 75)",
    "indigo": "rgb(94, 92, 230)",
    "orange": "rgb(255, 159, 10)",
    "pink": "rgb(255, 55, 95)",
    "purple": "rgb(191, 90, 242)",
    "red": "rgb(255, 69, 58)",
    "teal": "rgb(90, 200, 245)",
    "yellow": "rgb(255, 214, 10)",
}

Object.entries(chartColors).forEach(([key, value]) => setBrand(key, value))
