
pre.focus()
document.execCommand("paste")
pre.textContent = pre.textContent
pre.className = "R" + rand

function next() {
	init(window, rand, opts)
	st.appendChild(document.createTextNode("body," + css))
	formatBody({})
	formatEdit()
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
				if (window[msg.op]) window[msg.op](msg)
			}
		}
	})
	chrome.contextMenus.onClicked.addListener(function(info, tab) {
		var prom = chrome.tabs.getCurrent(onGot)
		if (prom) prom.then(onGot)
		function onGot(cur) {
			if (tab.index != cur.index) return
			window.conv({op:info.menuItemId})
		}
	})
}

