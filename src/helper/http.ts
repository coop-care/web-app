export type RequestOptions = {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    headers?: Record<string, any>;
    body?: Record<string, any>;
}

export type Response = {
    text: string;
}

export function httpRequest(url: string, options?: RequestOptions, dummyResponseData?: string): Promise<Response> {
    const http = window.cordova?.plugin?.http;

    if (http) {
        return promise<any>(http.sendRequest, url, undefined)
            .then(response => {
                return { text: response.data } as Response;
            })

    // DO NOT use this accidentially or in production:
    } else if (process.env.DEV && dummyResponseData) {
        return Promise.resolve({ text: dummyResponseData });

    // DO NOT use this accidentially or in production:
    } else if (process.env.DEV && process.env.WEBAPI_URL && options) {
        console.warn("Using WebProxy for", url);

        return fetch(`${process.env.WEBAPI_URL}/proxy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url,
                method: options?.method,
                headers: options?.headers,
                data: options?.body || undefined,
            })
        }).then(async response => {
            return {text: await response.text()}
        });

    } else {
        return fetch(url).then(async response => {
            return { text: await response.text() }
        });
    }
}

function promise<T>(method: (...args: any[]) => void, ...args: any[]): Promise<T> {
    return new Promise((resolve, reject) => method.apply(window, args.concat([resolve, reject])));
}
