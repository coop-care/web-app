import os from "os"

// needed in case process is undefined under Linux
export const platform = process.platform || os.platform()
export const isMac = platform == "darwin"
