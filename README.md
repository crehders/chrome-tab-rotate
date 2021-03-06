# Chrome Tab Rotate

Allows Chrome to automatically cycle through a set of tabs. Ideal for a Dashboard or wall-mounted display.

 - Preloads tabs for smoother transitions
 - Configured via a JSON file
 - Configuration can be loaded from a remote server

[Tab Rotate on the Chrome Web Store](https://chrome.google.com/webstore/detail/tab-rotate/pjgjpabbgnnoohijnillgbckikfkbjed)

## Settings

### readSettingsFromUrl - boolean
Automatically reload the settings file from the url provided.

### settingsReloadIntervalMinutes - integer
Interval at which the settings file is reloaded.

### fullscreen - boolean
Open Chrome in fullscreen mode

### websites - list

#### url - string


	// Automatically reload the settings file from the url provided
	"enableAutoReload": false

```json
{
	"readSettingsFromUrl": false,
	"settingsReloadIntervalMinutes": 60,
	"fullscreen": true,
	"websites" : [
		{
			"url" : "https://github.com/KevinSheedy/chrome-tab-rotate.git",
			"duration" : 10
		},
		{
			"url" : "https://chrome.google.com/webstore/detail/tab-rotate/pjgjpabbgnnoohijnillgbckikfkbjed",
			"duration" : 10
		},
		{
			"url" : "https://ie.linkedin.com/in/kevinsheedy",
			"duration" : 10
		}
	]
}
```