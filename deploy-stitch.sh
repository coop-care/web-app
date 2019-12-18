#!/usr/bin/env bash

STITCH_CLI=stitch-cli
APP_ID=openomaha-elgvq
STITCH_DIR=stitch

if [ $# -ne 2 ]; then
    echo "Usage: $0 publickey secretkey"
    exit 
fi
if ! [ -x "$(command -v $STITCH_CLI)" ]; then
    echo $STITCH_CLI is not installed!
    echo Please run: npm install -g mongodb-stitch-cli
    exit 1
fi

$STITCH_CLI login --api-key $1 --private-api-key $2 --yes || exit 1
quasar build || exit 1
echo "Preparing export..."
rm -rf $STITCH_DIR/ || exit 1
echo "Exporting..."
$STITCH_CLI export --app-id=$APP_ID --output=$STITCH_DIR --include-hosting || exit 1
echo "Preparing import..."
rm -rf $STITCH_DIR/hosting/files/ || exit 1
cp -R dist/spa $STITCH_DIR/hosting/files || exit 1
$STITCH_CLI import --app-id=$APP_ID --path=$STITCH_DIR --include-hosting --yes || exit 1
$STITCH_CLI logout

echo
echo "***"
echo "Successfully deployed to https://$APP_ID.mongodbstitch.com/#/"
echo "***"