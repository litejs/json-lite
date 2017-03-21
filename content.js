
!function() {
	var str, jsonpMatch, hovered, tag
	, chrome = this.chrome || this.browser
	, jsonRe = /^\s*(?:\[\s*(?=-?\d|true|false|null|["[{])[^]*\]|\{\s*"[^]+\})\s*$/
	, div = document.createElement("div")
	, body = document.body
	, first = body && body.firstChild
	, mod = /Mac|iPod|iPhone|iPad|Pike/.test(navigator.platform) ? "metaKey" : "ctrlKey"
	, rand = Math.random().toString(36).slice(2, 9)
	, HOV  = "H" + rand
	, KEY  = "K" + rand
	, STR  = "S" + rand
	, BOOL = "B" + rand
	, ERR  = "E" + rand
	, COLL = "C" + rand

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

	function init() {
		if (chrome) chrome.runtime.sendMessage({op: "init", rand: rand})
		tag = 1

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
	}

	function draw(str, to, first, box) {
		tag || init()

		var re = /("(?:((?:(?:https?|file):\/\/|data:[-+.=;\/\w]*,)(?:\\?\S)+?)|(?:\\?.)*?)")\s*(:?)|-?\d+\.?\d*(?:e[+-]?\d+)?|true|false|null|[[\]{},]|(\S[^-[\]{},"\d]*)/gi
		, node = div.cloneNode()
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

		to.addEventListener("click", function(e) {
			var target = e.target
			, open = target.classList.contains(COLL)
			if (target.tagName == "I") {
				if (target.classList.contains("M" + rand)) {
					target.previousSibling.appendChild(target.nextSibling.firstChild)
					target.parentNode.removeChild(target.nextSibling)
					target.parentNode.removeChild(target)
				} else if (e.altKey) {
					changeSiblings(target, COLL, !open)
				} else if (e[mod]) {
					open = target.nextSibling.querySelector("i")
					if (open) change(target.nextSibling, "i", COLL, !open.classList.contains(COLL))
				} else {
					target.classList[open ? "remove" : "add"](COLL)
				}
			}
		}, true)

		to.replaceChild(box = node, first)
		loop(str, re)

		function loop(str, re) {
			var len, match, val, tmp
			, i = 0
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
						tmp.classList.add(match[3] ? KEY : match[1] ? STR : match[4] ? ERR : BOOL)
						val = match[1] || val
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

	if (
		first &&
		(
			// pure json put inside PRE by browser
			first.tagName == "PRE" && first == body.lastElementChild ||
			// HTML page contains only json
			first == body.lastChild && first.nodeType == 3
		) &&
		(str = first.textContent) &&
		(
			/[+\/]json$/i.test(document.contentType) ||
			(jsonpMatch = /^\s*((?:\/\*\*\/\s*)?([$a-z_][$\w]*)\s*(?:&&\s*\2\s*)?\()([^]+)(\)[\s;]*)$/i.exec(str)) && jsonRe.test(jsonpMatch[3]) ||
			jsonRe.test(str)
		)
	) {
		if (jsonpMatch) {
			str = jsonpMatch[3]
			body.replaceChild(fragment(jsonpMatch[1], jsonpMatch[4]), first)
			first = body.lastChild.previousSibling
			first.parentNode.removeChild(first.previousSibling)
		}
		draw(str, body, first)
	}

	if (chrome) chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
		runCmd(req.op)
	})

	function runCmd(cmd) {
		var node
		, sel = window.getSelection()
		, range = sel.rangeCount && sel.getRangeAt(0)
		, str = range && range.toString()

		if (!str) return

		if (cmd === "formatSelection") {
			node = document.createElement("div")
			range.deleteContents()
			range.insertNode(node)
			sel.removeAllRanges()
			draw(str, node.parentNode, node, "X" + rand)
		}
	}
}()

