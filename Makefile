

# A 440x280 small tile icon that will be displayed on the Chrome Web Store wall.
# At least one 1280x800 or 640x400 screenshot (Chrome)
# Promotional Image 300x188px in case Opera editors decide to feature the extension as a recommended extension
#
# Icons:
# 128x128 - def
# 64x64 - Opera media
# 48x48 - (chrome://extensions)
# 32x32 - Windows
# 16x16 - favicon

# Install Hosted Web Apps (HWA) Command Line Interface (CLI)
# npm i -g hwa-cli

FILES=background.js content.js manifest.json options.html options.js img/icon-128.png img/icon-48.png img/icon-32.png
SAFARI_BUILD=json-lite.safariextension

.PHONY: safari

all: webextension safari

firefox:
	-rm firefox.zip
	git reset --hard
	#sed -nie '/<!-- Firefox/{n;p;n;d;};p' options.html
	sed -ie '/\/\* Firefox/d' options.js background.js
	sed -ie '/options_page/d' manifest.json
	zip firefox.zip $(FILES)

webextension:
	-rm app.zip
	git reset --hard
	#sed -i '/<!-- Firefox/,/-->/d' options.html
	sed -ie '/\/\* Firefox/,/\*\//d' options.js background.js
	sed -ie '/webRequest/d;/applications/,/^  }/d' manifest.json
	zip app.zip $(FILES)

safari:
	rm -rf $(SAFARI_BUILD)
	mkdir $(SAFARI_BUILD)
	cp $(FILES) safari/* $(SAFARI_BUILD)/

ie: webextension
	hwa convert app.zip
