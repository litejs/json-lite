

var css, opts
, chrome = this.chrome || this.browser
, storage = chrome.storage && (chrome.storage.sync || chrome.storage.local)
, rand = Math.random().toString(36).slice(2, 9)
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

readConf()
chrome.storage.onChanged.addListener(readConf)
chrome.runtime.onMessage.addListener(onMessage)

function readConf() {
	var got
	, promise = storage.get({
		font: "13px Menlo,monospace",
		bg: "#fff",
		color: "#000",
		info: "#ccc",
		infoHover: "#333;text-shadow: 1px 1px 3px #999",
		string: "#293",
		number: "#f0f",
		bool: "#10c",
		null: "#f00",
		property: "#66d",
		error: "#f00",
		menus: true,
		unescape: false,
		sizeLimit: 1048576000
	}, onGot)
	// Chrome uses storage.get(def, cb)
	// Firefox uses storage.get(def).then(cb)
	if (promise && promise.then) promise.then(onGot)
	function onGot(items) {
		if (got) return
		opts = items
		got = true
		css = [
			'.R', '{background:' + items.bg + ';white-space:pre-wrap}' +
			'.R', ',.D', '{font:' + items.font + ';color:' + items.color + '}' +
			'div.D', '{margin-left:4px;padding-left:1em;border-left:1px dotted ' + items.info + ';vertical-align:bottom}' +
			'.X', '{border:1px solid ' + items.info + ';padding:1em}' +
			'a.L', '{text-decoration:none}' +
			'a.L', ':hover,a.L', ':focus{text-decoration:underline}' +
			'i.I', ',i.M', '{cursor:pointer;color:' + items.info + '}' +
			'i.H', ',i.M', ':hover,i.I', ':hover{color:' + items.infoHover + '}'+
			'i.I', ':before{content:" ▼"}' +
			'i.C', ':before{content:" ▶"}' +
			'i.I', ':after,i.M', ':after{content:" " attr(data-c)}' +
			'i.C', '+.D', '{white-space:nowrap;text-overflow:ellipsis;margin:0;padding:0;border:0;display:inline-block;overflow:hidden;max-width:50%}' +
			'i.C', '+.D', ' :before{display:none}' +
			'i.C', '+.D', ' div,i.M', '+.D', '{width:1px;height:1px;margin:0;padding:0;border:0;display:inline-block;overflow:hidden;vertical-align:bottom}' +
			'.S', '{color:' + items.string + '}' +
			'.N', '{color:' + items.number + '}' +
			'.B', '{color:' + items.bool + '}' +
			'.K', '{color:' + items.property + '}' +
			'.E', '{color:' + items.error + '}' +
			'.O', '{color:' + items.null + '}' +
			'.E', ',.B', '{font-weight:bold}' +
			'div.E', '{font-size:120%;margin:0 0 1em}'
		].join(rand)

		chrome.contextMenus.removeAll()
		if (items.menus) {
			initMenu()
		}
	}
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
		onMessage({op: "formatSelection"}, {tab:tab, frameId: info.frameId})
	} else {
		chrome.tabs.executeScript(tab.id, {
			code: repaceSelection.toString()+";repaceSelection(" + fns[info.menuItemId].toString() + ")",
			frameId: info.frameId
		})
	}
})


function onMessage(message, sender, sendResponse) {
	if (!message || message.len > opts.sizeLimit) return sendResponse({op:"abort"})
	chrome.tabs.insertCSS(sender.tab.id, {
		code: (message.op == 'formatBody' ? 'body,' : '') + css,
		frameId: sender.frameId
	})
	chrome.tabs.executeScript(sender.tab.id, {
		code: "!" + init.toString() + "(this,'" + rand + "'," + JSON.stringify(opts) + ");this." + message.op + "()",
		frameId: sender.frameId
	})
}


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

function init(exports, rand, opts) {
	if (exports.formatBody) return
	var hovered
	, re = /("(?:((?:(?:https?|file):\/\/|data:[-+.=;\/\w]*,)(?:\\?\S)+?)|(?:\\?.)*?)")\s*(:?)|-?\d+\.?\d*(?:e[+-]?\d+)?|true|false|null|[[\]{},]|(\S[^-[\]{},"\d]*)/gi
	, div = document.createElement("div")
	, body = document.body
	, first = body && body.firstChild
	, mod = /Mac|iPod|iPhone|iPad|Pike/.test(navigator.platform) ? "metaKey" : "ctrlKey"
	, HOV  = "H" + rand
	, KEY  = "K" + rand
	, STR  = "S" + rand
	, BOOL = "B" + rand
	, NUM  = "N" + rand
	, NULL = "O" + rand
	, ERR  = "E" + rand
	, COLL = "C" + rand

	div.classList.add("D" + rand)
	document.addEventListener("keydown", keydown)
	document.addEventListener("keyup", function(e) {
		if (hovered) change(document, "." + HOV, HOV)
	})
	document.addEventListener("mouseover", function(e) {
		if (e.target.tagName === "I") {
			hovered = e.target
			keydown(e)
		}
	})
	document.addEventListener("mouseout", function(e) {
		if (hovered) {
			change(document, "." + HOV, HOV)
			hovered = null
		}
	})

	exports.formatBody = formatBody
	exports.formatSelection = formatSelection

	function units(size) {
		return size > 1048576 ? (0|(size / 1048576)) + " MB " :
		size > 1024 ? (0|(size / 1024)) + " KB " :
		size + " bytes "
	}

	function fragment(a, b) {
		var frag = document.createDocumentFragment()
		frag.appendChild(document.createTextNode(a))
		frag.appendChild(document.createElement("i")).classList.add("I" + rand)
		frag.appendChild(div.cloneNode())
		frag.appendChild(document.createTextNode(b))
		return frag
	}

	function change(node, query, name, set) {
		var list = node.querySelectorAll(query)
		, i = list.length
		for (; i--; ) list[i].classList[set ? "add" : "remove"](name)
	}

	function changeSiblings(node, name, set) {
		var tmp
		, query = []

		for (; node && node.tagName === "I"; ) {
			tmp = node.previousElementSibling
			query.unshift(
				".D" + rand + ">i.I" + rand +
				(tmp && tmp.classList.contains(KEY) || !query[0] ? "[data-k='" + node.dataset.k + "']" : "")
			)
			node = node.parentNode && node.parentNode.previousElementSibling
		}
		query[0] = ".R" + rand + ">i.I" + rand
		change(document, query.join("+"), name, set)
	}

	function keydown(e) {
		if (hovered) {
			e.preventDefault()
			if (e.altKey) {
				changeSiblings(hovered, HOV, 1)
			} else if (e[mod]) {
				change(hovered.nextSibling, "i.I" + rand, HOV, 1)
			}
		}
	}

	function onClick(e) {
		var target = e.target
		, isCollapsed = target.classList.contains(COLL)
		if (target.tagName == "I") {
			if (target.classList.contains("M" + rand)) {
				target.previousSibling.appendChild(target.nextSibling.firstChild)
				target.parentNode.removeChild(target.nextSibling)
				target.parentNode.removeChild(target)
			} else if (e.altKey) {
				changeSiblings(target, COLL, !isCollapsed)
			} else if (e[mod]) {
				isCollapsed = target.nextSibling.querySelector("i")
				if (isCollapsed) change(target.nextSibling, "i", COLL, !isCollapsed.classList.contains(COLL))
			} else {
				target.classList[isCollapsed ? "remove" : "add"](COLL)
			}
		}
	}

	function draw(str, to, first, box) {
		var node = div.cloneNode()
		, link = document.createElement("a")
		, span = document.createElement("span")
		, colon = document.createTextNode(": ")
		, comma = document.createTextNode(",\n")
		, path = []
		, cache = {
			"{": fragment("{", "}"),
			"[": fragment("[", "]")
		}

		node.className = "R" + rand + (box ? " " + box : "")

		link.classList.add("L" + rand)

		to.removeEventListener("click", onClick, true)
		to.addEventListener("click", onClick, true)

		to.replaceChild(box = node, first)
		loop(str, re)

		function loop(str, re) {
			var len, match, val, tmp
			, i = 0
			, unesc = opts.unescape
			try {
				for (; match = re.exec(str); ) {
					val = match[0]
					if (val == "{" || val == "[") {
						path.push(node)
						node.appendChild(cache[val].cloneNode(true))
						node = node.lastChild.previousSibling
						node.len = 1
						node.start = re.lastIndex
					} else if ((val == "}" || val == "]") && node.len) {
						if (node.childNodes.length) {
							tmp = node.previousElementSibling
							tmp.dataset.c = node.len + (
								node.len == 1 ?
								(val == "]" ? " item, " : " property, ") :
								(val == "]" ? " items, " : " properties, ")
							) + units(re.lastIndex - node.start + 1)

							tmp.dataset.k = (val = tmp.previousElementSibling) && val.classList.contains(KEY) ?
							val.textContent.replace(/'/, "\\'") :
							node.parentNode.len
						} else {
							node.parentNode.removeChild(node.previousSibling)
							node.parentNode.removeChild(node)
						}
						node = path.pop()
					} else if (val == ",") {
						node.len += 1
						node.appendChild(comma.cloneNode(true))
					} else {
						if (match[2]) {
							tmp = link.cloneNode()
							tmp.href = JSON.parse(match[1])
						} else {
							tmp = span.cloneNode()
						}
						if (match[3]) {
							tmp.classList.add(KEY)
						} else if (match[1]) {
							tmp.classList.add(STR)
						} else if (match[4]) {
							tmp.classList.add(ERR)
						} else if (match[0] === "true" || match[0] === "false") {
							tmp.classList.add(BOOL)
						} else if (match[0] === "null") {
							tmp.classList.add(NULL)
						} else {
							tmp.classList.add(NUM)
						}
						val = match[1] ? (unesc ? '"' + JSON.parse(match[1]) + '"' : match[1]) : val
						len = match[3] ? 140 : 1400
						if (val.length > len) {
							len >>= 1
							tmp.textContent = val.slice(0, len)
							node.appendChild(tmp)
							val = val.slice(len)
							tmp = node.appendChild(document.createElement("i"))
							tmp.classList.add("M" + rand)
							tmp.dataset.c = "+" + val.length + " more"
							tmp = span.cloneNode()
							tmp.classList.add("D" + rand)
						}
						tmp.textContent = val
						node.appendChild(tmp)
						if (match[3]) {
							node.appendChild(colon.cloneNode())
						}
					}
					if (++i > 9000) {
						len = str.length
						document.title = (0|(100*re.lastIndex/len)) + "% of " + units(len)
						return setTimeout(function() { loop(str, re) }, 0)
					}
				}
				document.title = ""
				JSON.parse(str)

			} catch(e) {
				tmp = box.insertBefore(document.createElement("div"), box.firstChild)
				tmp.className = ERR
				tmp.textContent = e
			}
		}
	}
	function formatBody() {
		draw(first.textContent, body, first)
		document.body.style.display = ""
	}
	function formatSelection() {
		var node
		, sel = window.getSelection()
		, range = sel.rangeCount && sel.getRangeAt(0)
		, str = range && range.toString()

		if (!str) return

		node = document.createElement("div")
		range.deleteContents()
		range.insertNode(node)
		sel.removeAllRanges()
		draw(str, node.parentNode, node, "X" + rand)
	}
}


