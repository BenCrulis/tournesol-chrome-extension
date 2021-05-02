# tournesol-chrome-extension

The extension allows to quickly rate a video from youtube on the Tournesol expert rating page.

See the wiki page [Contribute to Tournesol](https://wiki.tournesol.app/index.php/Contribute_to_Tournesol) for details.

## Chrome Docs

All the documentation for developing and distributing chrome extensions is here https://developer.chrome.com/docs/extensions/mv2/getstarted/

## Firefox Docs

To release the Firefox-extension:

- Get the latest version of "tournesol-chrome-extension" from Github
- Copy the "tournesol-chrome-extension" and name it "tournesol-firefox-extension"
- In a terminal, go inside this new directory and run the folloing command:
>> zip -r -FS ../tournesol-firefox-extension.zip * --exclude '*.git*'

- Connect to the Tournesol-app Firefox account
- Go to the manage extention page
- Click on "Send a new version"
- Select the zip file you just created
- Follow the on screen instructions
