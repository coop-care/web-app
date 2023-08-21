# Changelog

## 0.7.6 (2023-08-21)

- new problem: added step for adding multiple interventions by selecting from guidelines
- new problem: redesigned intervention step with expandable interventions instead of tab view
- intervention: while editing, add reference to guideline when intervention details match suggested intervention details from guidelines, or remove the reference when the intervention no longer matches
- when an intervention references a guideline, show intervention details text from guideline in UI instead of intervention details text for a better i18n adoption
- store Omaha System User's Guide and other guides in database with additional guideline meta data, load the localized guides on locale change and merge them to support multiple guides at once
- added guidelines to refactored acknowledgements

## 0.7.5 (2023-07-28)

- problem symptoms: added start and end dates to symptoms data model as symptoms can change over time, and updated problem classification and problem summary user interface accordingly
- task view: complete, omit or postpone a whole group of uncompleted tasks with a single action from an action menu
- task view date picker: highlight days that have scheduled tasks for the past, present and two months in advance, and improved date picker appearance transition
- task view: use reminder color (intervention / outcome) with category icon instead of that vertical bar and improved layout of tasks, especially rating reminder tasks
- show intervention category icon with every intervention category title in task view, contact task view, problem summary and proof of performance
- problem summary: improved layout of intervention list with edit button, especially on small screens

## 0.7.4 (2023-06-22)

- problem summary: added edit button for each intervention
- task view: only show a maximum of 20 overdue tasks at once and added a button to show the hidden ones
- task view: improved title, time ago, colors and spacing for overdue tasks
- task view: added link to rating reminder title to jump to rating view
- consistent mechanisms for copying data in client contacts and client health information: for mobile devices via long press gesture and for desktop devices via copy button appearing on mouse hover
- client health information: separate diagnoses and treatments and improved legibility of lists
- moved properties named likes, dislikes and biography from client health information to a new client biography page
- client agreements: added notes field to note additional agreements
- added success or error notification when saving problem record data
- changed default behavior of all QSelect components to always show the options as menu popup, except for iOS 16.3 and earlier where they are presented as modal dialog as fallback because of the lacking autofocus support in iOS
- Android virtual keyboard: consitent naming of enter key as next or enter button instead of search button
- new run scripts for developing, testing, building and publishing the app replacing the old ones
- development builds: new app icon and different app identifier

## 0.7.3 (2023-03-30)

- changed background and header of local auth page and added a login/logout transition
- added change password function to user settings page
- remember username of last login
- formal contacts can have Urls and the preferred label is "work"
- client problems: added option to show resolved problems
- use BOM for json file exports on non-cordova platforms so that utf-8 encoding will be detected

## 0.7.2 (2023-03-21)

- introduced local user account using strong cryptography and system keychains
- store all data in local encrypted database
- new login and registration page
- setup electron app with support for macOS and Windows builds
- support iOS TestFlight builds
- setup app build, packaging and deployment flows for multiple OS
- autoupdater for Android, Windows, macOS and iOS builds
- export client data as JSON, adjusted for iOS and Android using share sheets
- simplified onboarding by deriving user signature from username, together with names and locale
- added care setting property to client health data
- removed client history page

## 0.6.0 (2023-03-15)

- shift notes: new feature for writing briefly about special incidents in daily nursing care
- improved app navigation
- updating dependencies, migration to Vue 3 and Quasar 2
- attribution to the open source components in use and showing their licenses
- updated German translation of Omaha System terms and definitions with improvements

## 0.5.0 (2021-09-05)

- added insights page with charts visualizing the outcomes of care interventions for every team and all teams
- added a chart to client problems page summarizing the average outcomes of care interventions for this client
- added covid-19 guidelines for demo version and a guideline parser
- redirect to original URL after login
- added outcome expectation comment

## 0.4.0 (2021-04-09)

- community care: collect contact information from the client’s informal and formal network
- community care: manage tasks related to client contacts
- collect and assess client medical data and master data
- all client tabs and reports received print-friendly styles
- improved rating charts with details on hover using a faster, canvas-based chart library

## 0.3.0 (2021-02-04)

- team collaboration: add, invite or remove users to or from teams, manage roles and access rights
- team collaboration: add or remove clients to or from teams
- editable team settings
- improved problem admission user interface with plausibility checks and warnings
- problem summary view with collapsed and expanded state
- password reset
- editable user settings
- interactive demo version
- new default color scheme
- pull-to-refresh
- legal pages

## 0.2.0 (2020-06-26)

- recurring reminders for interventions and ratings
- task view as collaborative to-do list showing all reminders per day
- proof of performance view
- client record change history view
- problem records can be edited or dismissed
- navigation bar with titles
- configurable color scheme
- Content-Security-Policy

## 0.1.0 (2019-12-21)

- add and archive clients
- client problem admission including ratings and interventions based on the Omaha System
- problem summary view
- multilingual user interface (German, English) including German translation of Omaha System terms and definitions
- user registration, login and logout

