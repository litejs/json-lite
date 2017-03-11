

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

	var encMenu = chrome.contextMenus.create({
		title: "Encode",
		id: "e",
		contexts: [ "selection" ]
	})

	var decMenu = chrome.contextMenus.create({
		title: "Decode",
		id: "d",
		contexts: [ "selection" ]
	})

	chrome.contextMenus.create({
		title: "Base64",
		id: "btoa",
		contexts: [ "selection" ],
		parentId: encMenu
	})

	chrome.contextMenus.create({
		title: "Base64",
		id: "atob",
		contexts: [ "selection" ],
		parentId: decMenu
	})

	chrome.contextMenus.create({
		title: "Unicode",
		id: "unicode_encode",
		contexts: [ "selection" ],
		parentId: encMenu
	})
	chrome.contextMenus.create({
		title: "Unicode",
		id: "unicode_decode",
		contexts: [ "selection" ],
		parentId: decMenu
	})

	chrome.contextMenus.create({
		title: "Percent-encoding",
		id: "escape",
		contexts: [ "selection" ],
		parentId: encMenu
	})
	chrome.contextMenus.create({
		title: "Percent-encoding",
		id: "unescape",
		contexts: [ "selection" ],
		parentId: decMenu
	})
	var dateMenu = chrome.contextMenus.create({
		title: "Convert Time",
		id: "t",
		contexts: [ "selection" ]
	})

	chrome.contextMenus.create({
		title: "Timestamp to String",
		id: "toIso",
		contexts: [ "selection" ],
		parentId: dateMenu
	})

	chrome.contextMenus.create({
		title: "String to Timestamp",
		id: "toUnixTimestamp",
		contexts: [ "selection" ],
		parentId: dateMenu
	})

	chrome.contextMenus.create({
		title: "String to Timestamp (ms)",
		id: "toTimestamp",
		contexts: [ "selection" ],
		parentId: dateMenu
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
chrome.runtime.onMessage.addListener(function(message, sender) {
	if (!message) return
	if (message.op == "init") {
		var css = [
			'.R', '{background:#fff;white-space:pre-wrap}' +
			'.R', ',.D', '{font:13px Menlo,monospace}' +
			'div.D', '{margin-left:4px;padding-left:1em;border-left:1px dotted #ccc;vertical-align:bottom}' +
			'.X', '{border:1px solid #ccc;padding:1em}' +
			'a.L', '{text-decoration:none}' +
			'a.L', ':hover,a.L', ':focus{text-decoration:underline}' +
			'i.I', ',i.M', '{cursor:pointer;color:#ccc}' +
			'i.H', ',i.M', ':hover,i.I', ':hover{text-shadow: 1px 1px 3px #999;color:#333}'+
			'i.I', ':before{content:" ▼"}' +
			'i.C', ':before{content:" ▶"}' +
			'i.I', ':after,i.M', ':after{content:" " attr(data-c)}' +
			'i.C', '+.D', '{white-space:nowrap;text-overflow:ellipsis;margin:0;padding:0;border:0;display:inline-block;overflow:hidden;max-width:50%}' +
			'i.C', '+.D', ' :before{display:none}' +
			'i.C', '+.D', ' div,i.M', '+.D', '{width:1px;height:1px;margin:0;padding:0;border:0;display:inline-block;overflow:hidden;vertical-align:bottom}' +
			'.S', '{color:#293}' +
			'.K', '{color:#66d}' +
			'.E', '{color:#f12}' +
			'.B', '{color:#10c}' +
			'.E', ',.B', '{font-weight:bold}' +
			'div.E', '{font-size:120%;margin:0 0 1em}'
		].join(message.rand)
		console.log("rand", message.rand)
		chrome.tabs.insertCSS(sender.tab.id, {code: css})
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

