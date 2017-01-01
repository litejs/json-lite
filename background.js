

var chrome = this.chrome || this.browser

if (chrome.runtime.onInstalled) {
	chrome.runtime.onInstalled.addListener(initMenu)
} else {
	initMenu()
}

function initMenu() {

	chrome.contextMenus.create({
		title: "Format selection",
		id: "formatSelection",
		contexts: [ "selection" ]
	})

	chrome.contextMenus.create({
		type: "separator",
		id: "s1",
		contexts: [ "selection" ],
	})

	var base64Menu = chrome.contextMenus.create({
		title: "Base64",
		id: "b",
		contexts: [ "selection" ]
	})

	chrome.contextMenus.create({
		title: "Encode",
		id: "btoa",
		contexts: [ "selection" ],
		parentId: base64Menu
	})

	chrome.contextMenus.create({
		title: "Decode",
		id: "atob",
		contexts: [ "selection" ],
		parentId: base64Menu
	})

	var dateMenu = chrome.contextMenus.create({
		title: "Date",
		id: "d",
		contexts: [ "selection" ]
	})

	chrome.contextMenus.create({
		title: "Timestamp To ISO String",
		id: "toIso",
		contexts: [ "selection" ],
		parentId: dateMenu
	})

	chrome.contextMenus.create({
		title: "To Timestamp",
		id: "toUnixTimestamp",
		contexts: [ "selection" ],
		parentId: dateMenu
	})

	chrome.contextMenus.create({
		title: "To Timestamp in milliseconds",
		id: "toTimestamp",
		contexts: [ "selection" ],
		parentId: dateMenu
	})

	var unicodeMenu = chrome.contextMenus.create({
		title: "Unicode",
		id: "u",
		contexts: [ "selection" ]
	})

	chrome.contextMenus.create({
		title: "Encode",
		id: "unicode_encode",
		contexts: [ "selection" ],
		parentId: unicodeMenu
	})
	chrome.contextMenus.create({
		title: "Decode",
		id: "unicode_decode",
		contexts: [ "selection" ],
		parentId: unicodeMenu
	})
	var percentMenu = chrome.contextMenus.create({
		title: "Percent-encoding",
		id: "p",
		contexts: [ "selection" ]
	})

	chrome.contextMenus.create({
		title: "Encode",
		id: "escape",
		contexts: [ "selection" ],
		parentId: percentMenu
	})
	chrome.contextMenus.create({
		title: "Decode",
		id: "unescape",
		contexts: [ "selection" ],
		parentId: percentMenu
	})
}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	chrome.tabs.sendMessage(tab.id, { op: info.menuItemId })
})


