import { ipcMain } from "electron";
import { deletePassword, getPassword, setPassword } from "keytar";

export function setupKeySafe() {
    ipcMain.handle("get-password", (_, service: string, account: string) => 
        getPassword(service, account).then(result => result || undefined)
    );
    ipcMain.handle("set-password", (_, service: string, account: string, password: string) =>
        setPassword(service, account, password)
    );
    ipcMain.handle("remove-password", (_, service: string, account: string) =>
        deletePassword(service, account)
    );
}
