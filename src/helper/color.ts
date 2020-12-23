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
