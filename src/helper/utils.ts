
export function promise<T>(method: (...args: any[]) => void, ...args: any[]): Promise<T> {
    return new Promise((resolve, reject) => method.apply(window, args.concat([resolve, reject])));
}

export const incrementalName = (name: string, existingNames: string[] = []) => {
    let incrementedName = name;
    let index = 1;

    while (existingNames.includes(incrementedName)) {
        incrementedName = name + " " + index++;
    }

    return incrementedName;
}

export const debounce = <T, U extends (...args: any[]) => Promise<T>>(context: any, method: U, ms: number) => {
    let handle: number | undefined;
    const resolves: ((value: T) => void)[] = [];

    return ((...args: any[]) => {
        clearTimeout(handle);
        handle = window.setTimeout(() => {
            handle = undefined;
            void method.apply(context, args)
                .then(result => resolves.forEach(resolve => resolve(result)));
        }, ms);

        return new Promise((resolve: (value: T) => void) => resolves.push(resolve));
    }) as U;
};

export function sanitizeHTML(html: string) {
    const element = document.createElement("div");
    element.innerText = html;
    return element.innerHTML;
}

export function reportError(error: Error, context = "Unknown Error") {
    const address = "feedback@coopcare.de"
    const subject = encodeURI(context)
    const body = encodeURI("Error message:\n" + error.toString() + "\n\n" + error.stack?.toString() + "\n\n")
    return `mailto:${address}?subject=${subject}&body=${body}`;
}
