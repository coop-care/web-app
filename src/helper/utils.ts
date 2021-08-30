
export const incrementalName = (name: string, existingNames: string[] = []) => {
  let incrementedName = name;
  let index = 1;

  while (existingNames.includes(incrementedName)) {
    incrementedName = name + " " + index++;
  }

  return incrementedName;
}

export const debounce = <T>(method: (...args: any[]) => Promise<T>, ms: number) => {
  let handle: number | undefined;
  const resolves: ((value: T) => void)[] = [];

  return (...args: any[]) => {
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    clearTimeout(handle);
    handle = setTimeout(() => {
      handle = undefined;
      void method.apply(context, args)
        .then(result => resolves.forEach(resolve => resolve(result)));
    }, ms) as unknown as number;

    return new Promise((resolve: (value: T) => void) => resolves.push(resolve));
  };
};

export function sanitizeHTML(html: string) {
  const element = document.createElement("div");
  element.innerText = html;
  return element.innerHTML;
}
