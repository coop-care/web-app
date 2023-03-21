#!/bin/bash

CONFIGFILE="src-cordova/config.xml"
NEW_VERSION=${npm_package_version}

if [ -e $CONFIGFILE ]; then
    sed -i '' "s/\(widget.*version=\"\)\([0-9,.]*\)\"/\1$NEW_VERSION\"/" $CONFIGFILE
    # next line should be uncommented when npm version is not run with --no-git-tag-version
    # git add $CONFIG
else
    echo "Could not find $CONFIGFILE"
    exit 1
fi
