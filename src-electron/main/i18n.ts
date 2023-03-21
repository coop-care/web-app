import { app, BrowserWindow, ipcMain } from "electron"
import { matchLocale } from "../../src/boot/i18n"
import messages from "../../src/i18n/plain"
import { setupAppMenu } from "./menu"

const fallbackLocale = "en-us";

type MessagesType = typeof messages;
type LocaleKey = keyof MessagesType;

class I18n {
    locale: string
    fallbackLocale: string
    messages: MessagesType
    availableLocales: string[]

    constructor(locale: string, fallbackLocale: string, messages: MessagesType) {
        this.locale = locale;
        this.fallbackLocale = fallbackLocale;
        this.messages = messages;
        this.availableLocales = Object.keys(messages);
    }

    t(key: string, params: Record<string, any> = {}): string {
        const localizedMessages: Record<string, any> | undefined = 
            this.messages[this.locale as LocaleKey] || this.messages[this.fallbackLocale as LocaleKey];
        let text = localizedMessages?.[key] || key;
        
        Object.entries(params).forEach(([key, value]) => 
            text = text.replace(new RegExp(`{${key}}`, "g"), `${value}`)
        );

        return text;
    }
}

export const $i18n = new I18n(fallbackLocale, fallbackLocale, messages);

export function setupI18n() {
    $i18n.locale = matchLocale(app.getLocale().toLowerCase(), Object.keys(messages), fallbackLocale)

    ipcMain.on("did-change-locale", (_, locale: string) => changeLocale(locale))
}

export function changeLocale(locale: string) {
    if ($i18n.locale != locale) {
        $i18n.locale = locale
        setupAppMenu()
        BrowserWindow.getAllWindows()
            .forEach(window => window.webContents.send("did-change-locale", locale))
    }
}