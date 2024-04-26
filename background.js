
/*!
 * Copyright (c) 2016-2020 Lauri Rooden
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
	numCol: "#333",
	numBg: "#ccc",
	string: "#293",
	number: "#10c",
	bool: "#10c",
	null: "#10c",
	property: "#66d",
	error: "#f12",
	wrap: true,
	menus: true,
	unescape: false,
	sizeLimit: 10485760,
	indent: "  ",
	showDate: "hover",
	showDateFn: "toString",
	showSize: "collapsed",
	lineNo: true,
	newtab: false
}
, cssVar = {
	"always": "i.i",
	"hover": "i:hover.i",
	"never": "i.m"
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
			'html:has(>body.r', '),body.r', '{height:100%}' +
			'.r', '{box-sizing:border-box;margin:0;white-space:pre;overflow-wrap:break-word;word-wrap:break-word;outline:0 none;background:' + opts.bg + '}' +
			'.r', ',.d', '{font:' + opts.font + ';color:' + opts.color + '}' +
			'.r', '.w', '{white-space:pre-wrap}' +
			'div.r', '{position:relative;padding:10px 0 10px 20px}' +
			'div.d', '{vertical-align:bottom}' +
			(
				opts.lineNo ?
				'div.r' + rand + '{min-height:100%;border-left:60px solid ' + opts.numBg + '}' +
				'[data-l]:before{font-weight:normal;text-align:right;width:60px;content:attr(data-l);position:absolute;left:-68px;color:' + opts.numCol + '}' :
				'div.r' + rand + '{margin-left:8px}'
			) +
			'i.c', '+.d', '+[data-l]:before{display:none}' +
			'.x', '{border:1px solid ' + opts.info + ';padding:1em}' +
			'a.l', '{text-decoration:none}' +
			'a.l', ':hover,a.l', ':focus{text-decoration:underline}' +
			'i.i', ',i.m', '{cursor:pointer;font-style:normal;color:' + opts.info + '}' +
			'i.h', ',i.m', ':hover,i.i', ':hover{color:' + opts.infoHover + '}'+
			'i.i', ':before{position:absolute;left:0;content:"\u25BC";display:inline-block;padding:2px 9px;margin:-2px;transition:transform .2s}' +
			'i.c', ':before{transform:rotate(-90deg)}' +
			(cssVar[opts.showSize] || 'i.c'), ':after,i.m', ':after{margin-left:8px;content:attr(data-c)}' +
			'i.c', '+.d', '{white-space:nowrap;text-overflow:ellipsis;margin:0;padding:0;border:0;display:inline-block;overflow:hidden;max-width:50%}' +
			'i.c', '+.d', '+.q', '{white-space:nowrap}' +
			'i.c', '+.d', ' :before{display:none}' +
			'i.c', '+.d', ' div,i.m', '+.d', '{width:1px;height:1px;margin:0;padding:0;border:0;display:inline-block;overflow:hidden;vertical-align:bottom}' +
			'.s', '{color:' + opts.string + '}' +
			'.n', '{color:' + opts.number + '}' +
			(
				opts.showDate !== "never" ?
				'.n' + rand + '[data-c]' + (opts.showDate === 'hover' ? ':hover':'') +
				':after{z-index:1;position:absolute;margin-left:1em;padding:0 .6em;white-space:nowrap;background:' + opts.bg +
				';color:' + opts.infoHover + ';content:" // " attr(data-c)}' :
				''
			) +
			'.b', '{color:' + opts.bool + '}' +
			'.k', '{color:' + opts.property + '}' +
			'.e', '{color:' + opts.error + '}' +
			'.o', '{color:' + opts.null + '}' +
			'.e', ',.b', '{font-weight:bold}' +
			'div.e', '{font-size:120%;margin:0 0 1em}'
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
	var parent
	if (!opts.menus) return

	menu("formatSelection", "Format selection")
	menu("s1")

	parent = menu("e", "Encode")
	menu("stringify", "JSON.stringify()")
	menu("btoa", "Base64")
	menu("uniEnc", "Unicode")
	menu("esc", "Percent-encoding")

	parent = menu("d", "Decode", 1)
	menu("parse", "JSON.parse()")
	menu("atob", "Base64")
	menu("uniDec", "Unicode")
	menu("unesc", "Percent-encoding")

	parent = menu("t", "Convert Time", 1)
	menu("toIso", "Timestamp to String")
	menu("toUnix", "String to Timestamp")
	menu("toMs", "String to Timestamp (ms)")

	function menu(id, title, toRoot) {
		return chrome.contextMenus.create({
			id: id,
			title: title,
			type: title ? "normal" : "separator",
			contexts: [ "selection" ],
			parentId: toRoot ? null : parent
		})
	}
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
		chrome.tabs.create({url:chrome.runtime.getURL("edit.html")})
	} else if (from.tab) {
		if (from.tab.url.split(/[-:]/)[1] === "extension") return
		var op = msg.op
		, target = { tabId: from.tab.id }
		if (from.frameId) target.frameIds = [ from.frameId ]
		if (op.length > 9) {
			chrome.scripting.insertCSS({
				css,
				target
			})
		} else {
			op = "conv"
		}
		chrome.scripting.executeScript({
			args: [{}, rand, opts, op, msg],
			func: init,
			target,
			world: "MAIN"
		})
	} else {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			if (tabs[0]) onMsg(msg, { tab: tabs[0] })
		})
	}
	if (typeof res === "function") res({op:"ok"})
}


function init(exports, rand, opts, op, msg) {
	function run() {
		if (exports[op]) exports[op](msg)
	}
	if (exports.formatBody) return run()
	var hovered
	, re = /("(https?:\/\/|file:\/\/|data:[-+.=;\/\w]*,)?(?:\\.|[^\\])*?")\s*(:?)|-?\d+\.?\d*(?:e[+-]?\d+)?|true|false|null|[[\]{},]|(\S[^-[\]{},"\d]*)/gi
	, div = el("div", 0, "d")
	, body = document.body
	, first = body && body.firstChild
	, mod = /Mac|iPod|iPhone|iPad|Pike/.test(navigator.platform) ? "metaKey" : "ctrlKey"
	, HOV  = "h" + rand
	, KEY  = "k" + rand
	, STR  = "s" + rand
	, BOOL = "b" + rand
	, NUM  = "n" + rand
	, NULL = "o" + rand
	, ERR  = "e" + rand
	, COLL = "c" + rand
	, fns = {
		btoa: function(str) {
			return btoa(str)
		},
		atob: function(str) {
			return atob(str)
		},
		parse: function(str) {
			return JSON.parse(str)
		},
		stringify: function(str) {
			return JSON.stringify(str)
		},
		toIso: function(str) {
			var num = +str
			if (isNaN(num)) throw Error("NaN")
			return new Date(num < 4294967296 ? num * 1000 : num).toISOString()
		},
		toUnix: function(str) {
			var num = new Date(str)/1000
			if (isNaN(num)) throw Error("NaN")
			return num
		},
		toMs: function(str) {
			var num = +new Date(str)
			if (isNaN(num)) throw Error("NaN")
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

	function el(tag, to, addClass) {
		var el = document.createElement(tag)
		if (to) to.appendChild(el)
		if (addClass) el.classList.add(addClass + rand)
		return el
	}

	function txt(str, to) {
		var el = document.createTextNode(str)
		if (to) to.appendChild(el)
		return el
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
				".d" + rand + ">i.i" + rand +
				(tmp && tmp.classList.contains(KEY) || !query[0] ? "[data-k='" + node.dataset.k + "']" : "")
			)
			node = node.parentNode && node.parentNode.previousElementSibling
		}
		query[0] = ".r" + rand + ">i.i" + rand
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
			if (e.altKey) {
				changeSiblings(hovered, HOV, 1)
			} else if (e[mod]) {
				change(hovered.nextSibling, "i.i" + rand, HOV, 1)
			}
		}
	}

	function onClick(e) {
		var target = e.target
		, isCollapsed = target.classList.contains(COLL)
		e.stopPropagation()
		if (target.tagName === "I") {
			if (target.classList.contains("m" + rand)) {
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
		var afterColon
		, spaces = ""
		, node = div.cloneNode()
		, link = el("a", 0, "l")
		, span = el("span")
		, colon = txt(": ")
		, comma = txt(",\n")
		, path = []
		, lineNo = 1

		node.className = "r" + rand + (box ? " " + box : "") + (opts.wrap ? " w" + rand : "")

		if (opts.newtab) {
			link.target = "_blank"
		}

		to.addEventListener("click", onClick, true)

		to.replaceChild(box = node, first)
		loop(str, re)

		function fragment(a) {
			var frag = document.createDocumentFragment()
			el("span", frag).textContent = (afterColon ? ": " : spaces) + a
			if (!afterColon) frag.lastChild.dataset.l = lineNo++
			el("i", frag, "i")
			frag.appendChild(div.cloneNode())
			el("span", frag, "q").textContent = spaces + (a === "{" ? "}" : "]")
			return frag
		}

		function loop(str, re) {
			var len, match, val, tmp
			, i = 0
			, d = new Date
			, unesc = opts.unescape
			try {
				for (; match = re.exec(str); ) {
					val = match[0]
					if (val === "{" || val === "[") {
						path.push(node)
						node.appendChild(fragment(val))
						node = node.lastChild.previousSibling
						node.len = 1
						node.start = re.lastIndex
						spaces += opts.indent
					} else if ((val === "}" || val === "]") && node.len) {
						spaces = spaces.slice(opts.indent.length)
						if (node.childNodes.length) {
							node.nextSibling.dataset.l = lineNo++
							tmp = node.previousElementSibling
							val = node.len + (
								node.len === 1 ?
								(val === "]" ? " item, " : " property, ") :
								(val === "]" ? " items, " : " properties, ")
							) + units(re.lastIndex - node.start + 1)
							if (opts.showSize === "tooltip") tmp.title = val
							else tmp.dataset.c = val

							tmp.dataset.k = (val = tmp.previousElementSibling) && val.classList.contains(KEY) ?
							val.textContent.replace(/'|\\/g, "\\$&") :
							node.parentNode.len
						} else {
							node.nextSibling.textContent = val
							node.parentNode.removeChild(node.previousSibling)
							node.parentNode.removeChild(node)
						}
						node = path.pop()
					} else if (val === ",") {
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
								if (opts.showDate === "tooltip") tmp.title = d[opts.showDateFn]()
								else tmp.dataset.c = d[opts.showDateFn]()
							}
						}
						val = match[1] ? (unesc ? '"' + JSON.parse(match[1]) + '"' : match[1]) : val
						len = match[3] ? 140 : 1400
						if (afterColon) {
							node.appendChild(colon.cloneNode())
						} else {
							tmp.dataset.l = lineNo++
							if (node.lastChild) node.lastChild.textContent += spaces
							else val = spaces + val
						}
						if (val.length > len) {
							len >>= 1
							tmp.textContent = val.slice(0, len)
							node.appendChild(tmp)
							val = val.slice(len)
							el("i", node, "m").dataset.c = "+" + val.length + " more"
							tmp = span.cloneNode()
							tmp.classList.add("d" + rand)
						}
						tmp.textContent = val
						node.appendChild(tmp)
					}
					afterColon = match[3]
					if (++i > 9000) {
						len = str.length
						document.title = (0|(100*re.lastIndex/len)) + "% of " + units(len)
						return setTimeout(function() { loop(str, re) }, 0)
					}
				}
				document.title = ""
				window.data = JSON.parse(str)

			} catch(e) {
				tmp = box.insertBefore(el("div"), box.firstChild)
				tmp.className = ERR
				tmp.textContent = e
			}
		}
	}
	function formatBody(msg) {
		if (body.lastChild.className === "json-formatter-container") body.removeChild(body.lastChild)
		if (first.parentNode !== body) {
			first.textContent = body.textContent
			formatPlain()
		}
		draw(first.textContent, body, first)
		if (msg.add) {
			body.insertBefore(txt(msg.add[0]), body.firstChild)
			txt(msg.add[1], body)
		}
		body.className = "r" + rand
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
		draw(str, node.parentNode, node, "x" + rand)
	}
	function formatEdit() {
		for (var a = body.querySelectorAll(".r" + rand), i = a.length; i--; ) {
			a[i].contentEditable = "" + a[0].contentEditable != "true"
			a[i].spellcheck = false
		}
	}
	function formatPlain() {
		body.removeEventListener("click", onClick, true)
		body.textContent = ""
		body.appendChild(first)
	}
	run()
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


