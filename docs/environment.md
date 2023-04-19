
# Environment Variables

A list of commonly used environment variables in this project:

Key | Value
---|---
BACKEND | *storage: e.g. `demo` to build app in demo mode with example data and without persistent storage or (default) `local` for local database*
CSP_URLS | *URLs that need to be exempt from Content-Security-Policy, e.g. to check availability of app updates: `https://*.coopcare.de https://itunes.apple.com/lookup`* 
VAULTKEY | *string with 32 bytes secret to encrypt local vault*
BETA_EXPIRATION | *expiration date in the format `YYYY-MM-DD HH:mm:ss`*
APP_ID | *app identifier in reverse domain name notation*
UPDATE_URL | *URL that points to a directory that contains files with update information*
APPLE\_APP_ID | *10-digit number from app store connect*
TESTFLIGHT_URL | *deep link to app page in testflight app ending with APPLE\_APP\_ID, e.g. `https://beta.itunes.apple.com/v1/app/0000000000`*
TESTFLIGHT_INVITATION | *testflight invitation for this app e.g. `https://testflight.apple.com/join/<token>`*
APPLEID | *Apple ID of your developer account*
APPLEIDPASS | *the [app-specific password](https://support.apple.com/HT204397) created for your Apple ID, but not your Apple ID password!*
APPLE_TEAMID | *10-character Apple Team ID, from Xcode or your Apple Developer Account*
UPLOAD_FILES | *shell command to upload app builds to remote download directory on a webserver*
DOWNLOAD_DIRECTORY | *subdirectory on that remote web server*
CLEAR\_DOWNLOAD\_DIRECTORY | *shell command that is executed to remove older app builds from remote download directory before uploading new ones*
