
function reFormat() {
	setTimeout(function() {
		document.body.textContent = document.body.textContent.trim()
		func(rand, opts, "formatBody")
	}, 10)
}

function next() {
	reFormat()
	document.body.focus()
	document.body.addEventListener("cut", reFormat)
	document.body.addEventListener("paste", reFormat)
	editorStyle.appendChild(document.createTextNode('body>.r' + rand +':empty:after{display:"block";content:" Paste here";color:#bbb}body,' + css))
	// listen events directly as in chrome
	// background can not access to "chrome-extension:" uris
	chrome.runtime.onMessage.addListener(function(msg, from) {
		var prom = chrome.tabs.query({active: true, currentWindow: true}, onGot)
		if (prom) prom.then(onGot)
		function onGot(tabs) {
			var prom = chrome.tabs.getCurrent(onGot)
			if (prom) prom.then(onGot)
			function onGot(cur) {
				if (!tabs[0] || tabs[0].index != cur.index) return
				if (window[rand][msg.op]) window[rand][msg.op](msg)
			}
		}
	})
	chrome.contextMenus.onClicked.addListener(function(info, tab) {
		var prom = chrome.tabs.getCurrent(onGot)
		if (prom) prom.then(onGot)
		function onGot(cur) {
			if (tab.index != cur.index) return
			window[rand].conv({op:info.menuItemId})
		}
	})
}

