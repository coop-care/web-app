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

export function setupColors() {
    setColor("primary", "#009688");
    setColor("classification", "#f44336");
    setColor("outcome", "#009688");
    setColor("intervention", "#ff6f00");
}
