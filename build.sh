#!/bin/sh


echo "Building extension for Chrome. . ."

rm tournesol_extension_chrome.zip
cp manifest_chrome.json manifest.json
zip -r -FS tournesol_extension_chrome.zip * --exclude '.git'
rm manifest.json

echo "Building extension for Firefox. . ."

rm tournesol_extension_firefox.zip
cp manifest_firefox.json manifest.json
zip -r -FS tournesol_extension_firefox.zip * --exclude '.git'
rm manifest.json

echo "Done"