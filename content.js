
!function() {
	var str
	, div = document.createElement("div")
	, re = /^\s*(?:[[{]|(\w+\s*\()([[{].*)\)\s*$)/
	, body = document.body
	, first = body && body.firstChild
	, mod = /Mac|iPod|iPhone|iPad|Pike/.test(navigator.platform) ? "metaKey" : "ctrlKey"

	function units(size) {
		return size > 1048576 ? (0|(size / 1048576)) + " MB " :
		size > 1024 ? (0|(size / 1024)) + " KB " :
		size + " bytes "
	}

	function fragment(a, b) {
		var frag = document.createDocumentFragment()
		frag.appendChild(document.createTextNode(a))
		if (b) {
			frag.appendChild(div.cloneNode())
			frag.appendChild(document.createTextNode(b))
		} else {
			frag.appendChild(document.createElement("br"))
		}
		return frag
	}

	function change(node, query, name, set) {
		var list = node.querySelectorAll(query)
		, i = list.length
		for (; i--; ) list[i].classList[set ? "add" : "remove"](name)
	}

	function changeSiblings(node, name, set) {
		var txt, tmp
		, i = 0
		, query = []

		for (; node && node.tagName === "I"; ) {
			if ((tmp = node.previousElementSibling) && tmp.className == "c2") {
				txt = tmp.textContent
				query.unshift("div>.c2+i[data-key='" + node.dataset.key + "']")
			} else {
				i = 0
				for (tmp = node; tmp = tmp.previousElementSibling; tmp.tagName === "BR" && i++);
				query.unshift("div>" + (i ? "br:nth-of-type(" + i + ")+i" : "i:first-child"))
			}
			node = node.parentNode && node.parentNode.previousElementSibling
		}
		if (!query[1]) return
		query[0] = query[1] = "div>i"

		change(document, "body>" + query.join("+"), name, set)
	}

	function draw(str, to, first) {
		var hovered
		, re = /("(?:\\?.)*?")\s*(:?)|-?\d+\.?\d*(?:e[+-]?\d+)?|true|false|null|[[\]{},]|(\S[^-[\]{},"\d]*)/gi
		, node = div
		, span = document.createElement("span")
		, info = document.createElement("i")
		, colon = document.createTextNode(": ")
		, comma = fragment(",")
		, path = []
		, cache = {
			"{": fragment("{", "}"),
			"[": fragment("[", "]")
		}

		function keydown(e) {
			if (hovered) {
				e.preventDefault()
				if (e.altKey) {
					changeSiblings(hovered, "hi", 1)
				} else if (e[mod]) {
					change(hovered.nextSibling, "i", "hi", 1)
				}
			}
		}
		document.addEventListener("keydown", keydown)

		document.addEventListener("keyup", function(e) {
			if (hovered) change(document, ".hi", "hi")
		})

		document.addEventListener("mouseover", function(e) {
			if (e.target.tagName === "I") {
				hovered = e.target
				keydown(e)
			}
		})

		document.addEventListener("mouseout", function(e) {
			if (hovered && (e.altKey || e[mod])) change(document, ".hi", "hi")
			hovered = null
		})

		to.addEventListener("click", function(e) {
			var target = e.target
			, open = target.classList.contains("is-collpsed")
			if (target.tagName == "I") {
				if (e.altKey) {
					changeSiblings(target, "is-collpsed", !open)
				} else if (e[mod]) {
					open = target.nextSibling.querySelector("i")
					if (open) change(target.nextSibling, "i", "is-collpsed", !open.classList.contains("is-collpsed"))
				} else {
					target.classList[open ? "remove" : "add"]("is-collpsed")
				}
			}
		}, true)

		to.replaceChild(node, first)
		loop()

		function loop() {
			var match, val, tmp
			, i = 0
			, len = str.length
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
							tmp = info.cloneNode()
							tmp.dataset.content = node.len + (
								node.len == 1 ?
								(val == "]" ? " item, " : " property, ") :
								(val == "]" ? " items, " : " properties, ")
							) + units(re.lastIndex - node.start + 1)

							if ((val = node.previousElementSibling) && val.className == "c2") {
								tmp.dataset.key = val.textContent.slice(1, -1).replace(/'/, "\\'")
							}
							node.parentNode.insertBefore(tmp, node)
						} else {
							node.parentNode.removeChild(node)
						}
						node = path.pop()
					} else if (val == ",") {
						node.len += 1
						node.appendChild(comma.cloneNode(true))
					} else {
						tmp = span.cloneNode()
						tmp.textContent = match[1] || val
						tmp.className = match[2] ? "c2": match[1] ? "c1": match[3] ? "c3" : "c4"
						node.appendChild(tmp)
						if (match[2]) {
							node.appendChild(colon.cloneNode())
						}
					}
					if (++i > 1000) {
						document.title = (0|(100*re.lastIndex/len)) + "% of " + units(len)
						requestAnimationFrame(loop)
						return
					}
				}
				document.title = ""
				JSON.parse(str)

			} catch(e) {
				tmp = document.createElement("h3")
				tmp.className = "c3"
				tmp.textContent = e
				to.insertBefore(tmp, to.firstChild)
			}
		}
	}

	if (first && (
			first == body.lastElementChild && first.tagName == "PRE" ||
			first == body.lastChild && first.nodeType == 3
		)) {
		str = first.textContent
		if (re = re.exec(str)) {
			var tag = document.createElement("style")
			tag.textContent = 'h3{margin:1em}div{margin-left:4px;padding-left:1em;border-left:1px dotted #ccc;font:13px Menlo,monospace;pointer-events:none}body>div{border:none}i{cursor:pointer;color:#ccc;pointer-events:auto}.hi,i:hover{text-shadow: 1px 1px 3px #999;color:#333}i:before{content:" ▼ "}i.is-collpsed:before{content:" ▶ "}i:after{content:attr(data-content)}i.is-collpsed+div{display:none}.c1{color:#293}.c2{color:#66d}.c3{color:#f12}.c4{color:#10c}.c3,.c4{font-weight:bold}'
			document.head.appendChild(tag)
			if (re[1]) {
				str = re[2]
				body.replaceChild(fragment(re[1], ")"), first)
				first = body.lastChild.previousSibling
			}
			draw(str, body, first)
		}
	}
}()

