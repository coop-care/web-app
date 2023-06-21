import { Platform } from "quasar";

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

/**
 * Behavior value for QSelect components. It defines whetther the QSelect options are 
 * displayed as a simple menu popup in their current context or presented as a modal dialog.
 * We prefer the menu popup because of it's simplicity and also because the QSelect input has 
 * no autofocus on iOS when presented as modal dialog, because iOS does not support autofocus,
 * which means the keyboard is not displayed automatically and the user has to tap the input
 * twice to enter text which feels quite inconvenient.
 * At the same time, every iOS version below iOS 16.4 had a CSS bug with position:fixed
 * which leads to even more inconvenient behavior so that a modal dialog is an acceptable
 * workaround.
 * For all these reasons our strategy is to override Quasar's default behavior and
 * always display the options as menu popup for mobile and desktop platforms, 
 * except for iOS 16.3 and earlier where we use the modal dialog as fallback.
 * @returns `menu` or `default`. `default` means, the QSelect options are displayed as
 * modal dialog on mobile platforms and as simple menu popup for desktop platforms. 
 * `menu` ensures that the options are always displayed as menu popup.
 */
export function selectBehavior() {
    return Platform.is.android 
      || (Platform.is.ios && window["ScreenOrientation"] != undefined) // iOS 16.4 or higher, where position:fixed bug is resolved
        ? "menu"
        : "default"
}
