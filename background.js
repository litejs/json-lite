

var chrome = this.chrome || this.browser
, fns = {
	btoa: function(str) {
		return btoa(str)
	},
	atob: function(str) {
		return atob(str)
	},
	toIso: function(str) {
		var num = +str
		if (isNaN(num)) throw new Error("NaN")
		return new Date(num < 4294967296 ? num * 1000 : num).toISOString()
	},
	toUnixTimestamp: function(str) {
		var num = new Date(str)/1000
		if (isNaN(num)) throw new Error("NaN")
		return num
	},
	toTimestamp: function(str) {
		var num = +new Date(str)
		if (isNaN(num)) throw new Error("NaN")
		return num
	},
	unicode_encode: function(str) {
		return unescape(escape(str).replace(/%u/g, "\\u"))
	},
	unicode_decode: function(str) {
		return unescape(str.replace(/\\u/g, "%u"))
	},
	escape: function(str) {
		return escape(str)
	},
	unescape: function(str) {
		return unescape(str)
	}
}

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
	if (info.menuItemId === "formatSelection") {
		chrome.tabs.sendMessage(tab.id, { op: info.menuItemId })
	} else {
		chrome.tabs.executeScript(tab.id, {
			code: repaceSelection.toString()+";repaceSelection(" + fns[info.menuItemId].toString() + ")"
		})
	}
})

// var c=getSelection().getRangeAt(0).cloneContents(); c.querySelectorAll('*')
function repaceSelection(fn) {
	var node
	, sel = window.getSelection()
	, range = sel.rangeCount && sel.getRangeAt(0)
	, str = range && range.toString()

	if (!str) return

	try {
		node = document.createTextNode(fn(str))
		range.deleteContents()
		range.insertNode(node)
	} catch(e) {
		alert(e)
	}
}

