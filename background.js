

var browser = this.chrome || this.browser

if (browser.runtime.onInstalled) {
	browser.runtime.onInstalled.addListener(initMenu)
} else {
	initMenu()
}

function initMenu() {

	browser.contextMenus.create({
		title: "Format selection",
		id: "formatSelection",
		contexts: [ "selection" ]
	})

	browser.contextMenus.create({
		type: "separator",
		id: "s1",
		contexts: [ "selection" ],
	})

	var base64Menu = browser.contextMenus.create({
		title: "Base64",
		id: "b",
		contexts: [ "selection" ]
	})

	browser.contextMenus.create({
		title: "Encode",
		id: "btoa",
		contexts: [ "selection" ],
		parentId: base64Menu
	})

	browser.contextMenus.create({
		title: "Decode",
		id: "atob",
		contexts: [ "selection" ],
		parentId: base64Menu
	})

	var dateMenu = browser.contextMenus.create({
		title: "Date",
		id: "d",
		contexts: [ "selection" ]
	})

	browser.contextMenus.create({
		title: "Timestamp To ISO String",
		id: "toIso",
		contexts: [ "selection" ],
		parentId: dateMenu
	})

	browser.contextMenus.create({
		title: "To Timestamp",
		id: "toUnixTimestamp",
		contexts: [ "selection" ],
		parentId: dateMenu
	})

	browser.contextMenus.create({
		title: "To Timestamp in milliseconds",
		id: "toTimestamp",
		contexts: [ "selection" ],
		parentId: dateMenu
	})

	var unicodeMenu = browser.contextMenus.create({
		title: "Unicode",
		id: "u",
		contexts: [ "selection" ]
	})

	browser.contextMenus.create({
		title: "Encode",
		id: "unicode_encode",
		contexts: [ "selection" ],
		parentId: unicodeMenu
	})
	browser.contextMenus.create({
		title: "Decode",
		id: "unicode_decode",
		contexts: [ "selection" ],
		parentId: unicodeMenu
	})
	var percentMenu = browser.contextMenus.create({
		title: "Percent-encoding",
		id: "p",
		contexts: [ "selection" ]
	})

	browser.contextMenus.create({
		title: "Encode",
		id: "escape",
		contexts: [ "selection" ],
		parentId: percentMenu
	})
	browser.contextMenus.create({
		title: "Decode",
		id: "unescape",
		contexts: [ "selection" ],
		parentId: percentMenu
	})
}

browser.contextMenus.onClicked.addListener(function(info, tab) {
	browser.tabs.sendMessage(tab.id, { op: info.menuItemId })
})


