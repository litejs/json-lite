
/*!
 * Copyright (c) 2016-2018 Lauri Rooden
 * https://www.litejs.com/MIT-LICENSE.txt
 */


var css, next, opts
, chrome = this.chrome || this.browser
, storage = chrome.storage && (chrome.storage.sync || chrome.storage.local)
, editor = !!this.pre
, defOpts = {
	theme: "",
	font: "13px Menlo,monospace",
	bg: "#fff",
	color: "#000",
	info: "#ccc",
	infoHover: "#333;text-shadow: 1px 1px 3px #999",
	string: "#293",
	number: "#10c",
	bool: "#10c",
	null: "#10c",
	property: "#66d",
	error: "#f12",
	menus: true,
	unescape: false,
	sizeLimit: 10485760,
	showDate: "hover",
	showDateFn: "toString",
	showSize: "collapsed",
	newtab: false
}
, cssVar = {
	"always": "i.I",
	"hover": "i:hover.I",
	"never": "i.M"
}
, rand = Math.random().toString(36).slice(2, 9)

if (!editor) {
	chrome.storage.onChanged.addListener(readConf)
	chrome.runtime.onMessage.addListener(onMsg)
	chrome.contextMenus.onClicked.addListener(function(info, tab) {
		onMsg({op: info.menuItemId}, {tab:tab, frameId: info.frameId})
	})
}
readConf()

function readConf() {
	var got
	, prom = storage.get(defOpts, onGot)
	// Chrome uses storage.get(def, cb)
	// Firefox uses storage.get(def).then(cb)
	if (prom && prom.then) prom.then(onGot)
	function onGot(items) {
		if (got) return
		opts = items || defOpts
		got = true
		css = [
			'.R', '{background:' + opts.bg + ';white-space:pre-wrap;overflow-wrap:break-word;word-wrap:break-word;outline:0 none}' +
			'.R', ',.D', '{font:' + opts.font + ';color:' + opts.color + '}' +
			'div.D', '{margin-left:4px;padding-left:1em;border-left:1px dotted ' + opts.info + ';vertical-align:bottom}' +
			'.X', '{border:1px solid ' + opts.info + ';padding:1em}' +
			'a.L', '{text-decoration:none}' +
			'a.L', ':hover,a.L', ':focus{text-decoration:underline}' +
			'i.I', ',i.M', '{cursor:pointer;font-style:normal;color:' + opts.info + '}' +
			'i.H', ',i.M', ':hover,i.I', ':hover{color:' + opts.infoHover + '}'+
			'i.I', ':before{content:"▼";display:inline-block;padding:1px 5px;margin:-1px;transition:transform .2s}' +
			'i.C', ':before{transform:rotate(-90deg)}' +
			(cssVar[opts.showSize] || 'i.C'), ':after,i.M', ':after{content:attr(data-c)}' +
			'i.C', '+.D', '{white-space:nowrap;text-overflow:ellipsis;margin:0;padding:0;border:0;display:inline-block;overflow:hidden;max-width:50%}' +
			'i.C', '+.D', ' :before{display:none}' +
			'i.C', '+.D', ' div,i.M', '+.D', '{width:1px;height:1px;margin:0;padding:0;border:0;display:inline-block;overflow:hidden;vertical-align:bottom}' +
			'.S', '{color:' + opts.string + '}' +
			'.N', '{position:relative;color:' + opts.number + '}' +
			(
				opts.showDate !== "never" ?
				'.N' + rand + '[data-c]' + (opts.showDate === 'hover' ? ':hover':'') +
				':after{position:absolute;left:100%;top:0;margin-left:1em;padding:0 .6em;white-space:nowrap;background:' + opts.bg +
				';color:' + opts.infoHover + ';content:" // " attr(data-c)}' :
				''
			) +
			'.B', '{color:' + opts.bool + '}' +
			'.K', '{color:' + opts.property + '}' +
			'.E', '{color:' + opts.error + '}' +
			'.O', '{color:' + opts.null + '}' +
			'.E', ',.B', '{font-weight:bold}' +
			'div.E', '{font-size:120%;margin:0 0 1em}'
		].join(rand)

		if (!editor) {
			chrome.contextMenus.removeAll(initMenu)
		}
		if (typeof next === "function") {
			next()
			next = null
		}
	}
}

function initMenu() {
	if (!opts.menus) return

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
		id: "uniEnc",
		contexts: [ "selection" ],
		parentId: encMenu
	})
	chrome.contextMenus.create({
		title: "Unicode",
		id: "uniDec",
		contexts: [ "selection" ],
		parentId: decMenu
	})

	chrome.contextMenus.create({
		title: "Percent-encoding",
		id: "esc",
		contexts: [ "selection" ],
		parentId: encMenu
	})
	chrome.contextMenus.create({
		title: "Percent-encoding",
		id: "unesc",
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
		id: "toUnix",
		contexts: [ "selection" ],
		parentId: dateMenu
	})

	chrome.contextMenus.create({
		title: "String to Timestamp (ms)",
		id: "toMs",
		contexts: [ "selection" ],
		parentId: dateMenu
	})
}

function onMsg(msg, from, res) {
	if (!opts) {
		next = onMsg.bind(null, msg, from, res)
		return true
	}
	if (!msg || msg.len > opts.sizeLimit) {
		if (typeof res === "function") res({op:"abort"})
		return
	}
	if (msg.op === "openEditor") {
		chrome.tabs.create({url:chrome.extension.getURL("edit.html")})
	} else if (from.tab) {
		if (from.tab.url.split(/[-:]/)[1] == "extension") return
		var op = msg.op
		if (op.length > 9) {
			chrome.tabs.insertCSS(from.tab.id, {
				code: (msg.op == 'formatBody' ? 'body,' : '') + css,
				frameId: from.frameId
			})
		} else {
			op = "conv"
		}
		chrome.tabs.executeScript(from.tab.id, {
			code: "!" + init.toString() + "(this,'" + rand + "'," + JSON.stringify(opts) + ");this." + op + "(" + JSON.stringify(msg) + ")",
			frameId: from.frameId
		})
	} else {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			if (tabs[0]) onMsg(msg, { tab: tabs[0] })
		})
	}
	if (typeof res === "function") res({op:"ok"})
}


function init(exports, rand, opts) {
	if (exports.formatBody) return
	var hovered
	, re = /("(?:((?:(?:https?|file):\/\/|data:[-+.=;\/\w]*,)(?:\\?\S)*?)|(?:\\?.)*?)")\s*(:?)|-?\d+\.?\d*(?:e[+-]?\d+)?|true|false|null|[[\]{},]|(\S[^-[\]{},"\d]*)/gi
	, div = el("div")
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
		toUnix: function(str) {
			var num = new Date(str)/1000
			if (isNaN(num)) throw new Error("NaN")
			return num
		},
		toMs: function(str) {
			var num = +new Date(str)
			if (isNaN(num)) throw new Error("NaN")
			return num
		},
		uniEnc: function(str) {
			return unescape(escape(str).replace(/%u/g, "\\u"))
		},
		uniDec: function(str) {
			return unescape(str.replace(/\\u/g, "%u"))
		},
		esc: function(str) {
			return escape(str)
		},
		unesc: function(str) {
			return unescape(str)
		}
	}

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
	exports.formatPlain = formatPlain
	exports.formatEdit = formatEdit
	exports.conv = conv

	function units(size) {
		return size > 1048576 ? (0|(size / 1048576)) + " MB " :
		size > 1024 ? (0|(size / 1024)) + " KB " :
		size + " bytes "
	}

	function el(tag, to) {
		var el = document.createElement(tag)
		if (to) to.appendChild(el)
		return el
	}

	function txt(str, to) {
		var el = document.createTextNode(str)
		if (to) to.appendChild(el)
		return el
	}

	function fragment(a, b) {
		var frag = document.createDocumentFragment()
		txt(a, frag)
		el("i", frag).classList.add("I" + rand)
		frag.appendChild(div.cloneNode())
		txt(b, frag)
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
	// var c=getSelection().getRangeAt(0).cloneContents(); c.querySelectorAll('*')
	function conv(msg) {
		var node
		, sel = window.getSelection()
		, range = sel.rangeCount && sel.getRangeAt(0)
		, str = range && range.toString()

		if (!str) return

		try {
			node = txt(fns[msg.op](str))
			range.deleteContents()
			range.insertNode(node)
		} catch(e) {
			alert(e)
		}
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
		e.stopPropagation()
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
		, link = el("a")
		, span = el("span")
		, colon = txt(": ")
		, comma = txt(",\n")
		, path = []
		, cache = {
			"{": fragment("{", "}"),
			"[": fragment("[", "]")
		}

		node.className = "R" + rand + (box ? " " + box : "")

		link.classList.add("L" + rand)
		if (opts.newtab) {
			link.target = "_blank"
		}

		to.addEventListener("click", onClick, true)

		to.replaceChild(box = node, first)
		loop(str, re)

		function loop(str, re) {
			var len, match, val, tmp
			, i = 0
			, d = new Date
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
							val = node.len + (
								node.len == 1 ?
								(val == "]" ? " item, " : " property, ") :
								(val == "]" ? " items, " : " properties, ")
							) + units(re.lastIndex - node.start + 1)
							if (opts.showSize == "title") tmp.title = val
							else tmp.dataset.c = val

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
							tmp.classList.add(val <= Number.MAX_SAFE_INTEGER ? NUM : ERR)
							if (opts.showDate !== "never" && val > 1e9 && val < 1e14) {
								d.setTime(val < 4294967296 ? val * 1000 : val)
								if (opts.showDate == "title") tmp.title = d[opts.showDateFn]()
								else tmp.dataset.c = d[opts.showDateFn]()
							}
						}
						val = match[1] ? (unesc ? '"' + JSON.parse(match[1]) + '"' : match[1]) : val
						len = match[3] ? 140 : 1400
						if (val.length > len) {
							len >>= 1
							tmp.textContent = val.slice(0, len)
							node.appendChild(tmp)
							val = val.slice(len)
							tmp = el("i", node)
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
				tmp = box.insertBefore(el("div"), box.firstChild)
				tmp.className = ERR
				tmp.textContent = e
			}
		}
	}
	function formatBody(msg) {
		if (first.parentNode !== body) {
			first.textContent = body.textContent
			formatPlain()
		}
		draw(first.textContent, body, first)
		if (msg.add) {
			body.insertBefore(txt(msg.add[0]), body.firstChild)
			txt(msg.add[1], body)
		}
		body.style.display = ""
	}
	function formatSelection() {
		var node
		, sel = window.getSelection()
		, range = sel.rangeCount && sel.getRangeAt(0)
		, str = range && range.toString()

		if (!str) return

		node = el("div")
		range.deleteContents()
		range.insertNode(node)
		sel.removeAllRanges()
		draw(str, node.parentNode, node, "X" + rand)
	}
	function formatEdit() {
		var state
		document.querySelectorAll(".R" + rand)
		.forEach(function(el, i) {
			if (i === 0) state = "" + el.contentEditable != "true"
			el.contentEditable = state
			el.spellcheck = false
		})
	}
	function formatPlain() {
		body.removeEventListener("click", onClick, true)
		body.textContent = ""
		body.appendChild(first)
	}
}

/* Firefox
 if (chrome.webRequest) chrome.webRequest.onHeadersReceived.addListener(
	rewriteHeader,
	{ urls: ["<all_urls>"] },
	["blocking", "responseHeaders"]
)

function rewriteHeader(e) {
	var h
	, re = /\bjson\b/i
	, headers = e.responseHeaders
	, len = headers && headers.length
	if (len) for (; len--; ) {
		h = headers[len]
		if (h.name.toLowerCase() === "content-type" && re.test(h.value)) {
			h.value = "application/json"
			break;
		}
	}
	return {responseHeaders: headers}
}
//*/


