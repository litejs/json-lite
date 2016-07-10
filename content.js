
!function() {
	function units(size) {
		return size > 1048576 ? (0|(size / 1048576)) + " MB " :
		size > 1024 ? (0|(size / 1024)) + " KB " :
		size + " bytes "
	}

	function toggleAll(node, toggle) {
		var txt
		, tmp = ".c2"

		for (; node = !txt && (node.previousSibling || node.parentNode); ) {
			if (node.className == "c2") {
				txt = node.textContent
				break
			}
		}
		for (; node; node = node.parentNode) {
			if (node.tagName == "DIV") {
				tmp = "div>" + tmp
			}
		}

		node = document.querySelectorAll("body>" + tmp)

		for (tmp = node.length; tmp--; ) {
			if (node[tmp].textContent == txt) {
				node[tmp].nextSibling.nextSibling.nextSibling.classList
				.toggle("is-collpsed", toggle)
			}
		}
	}

	function draw(str, to, first) {
		var re = /("(?:\\?.)*?")\s*(:?)|-?\d+\.?\d*(?:e[+-]?\d+)?|true|false|null|[[\]{},]|(\S[^-[\]{},"\d]*)/gi
		, node = document.createElement("div")
		, span = document.createElement("span")
		, comm = document.createElement("i")
		, colon = document.createTextNode(": ")
		, path = []
		, cache = {
			"{": fragment("{", "}"),
			"[": fragment("[", "]"),
			",": fragment(",")
		}

		function fragment(a, b) {
			var frag = document.createDocumentFragment()
			frag.appendChild(document.createTextNode(a))
			frag.appendChild(node.cloneNode())
			if (b) {
				frag.appendChild(document.createTextNode(b))
			}
			return frag
		}

		to.addEventListener("click", function(e) {
			var toggle
			, target = e.target
			if (target.tagName == "I") {
				toggle = target.classList.toggle("is-collpsed")
				if (e.ctrlKey) {
					toggleAll(target, toggle)
				}
			}
		}, true)

		to.replaceChild(node, first)
		loop(str, re)

		function loop(srt, re) {
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
							tmp = comm.cloneNode()
							tmp.dataset.content = node.len + (
								node.len == 1 ?
								(val == "]" ? " item, " : " property, ") :
								(val == "]" ? " items, " : " properties, ")
							) + units(re.lastIndex - node.start + 1)
							node.parentNode.insertBefore(tmp, node)
						} else {
							node.parentNode.removeChild(node)
						}
						node = path.pop()
					} else if (val == ",") {
						node.len += 1
						node.appendChild(cache[val].cloneNode(true))
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
						setTimeout(function() {
							loop(str, re)
						}, 1)
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

	var str, chr
	, body = document.body
	, first = body && body.firstChild
	if (first && first == body.lastChild && (first.tagName == "PRE" || first.nodeType == 3)) {
		str = first.textContent
		chr = str.charAt(0)
		if (chr == "{" || chr == "[") {
			var tag = document.createElement("style")
			tag.textContent = 'h3{margin:1em}div{margin-left:4px;padding-left:1em;border-left:1px dotted #ccc;font:13px monospace}body>div{border:none}i{cursor:pointer;color:#ccc}i:hover{color:#999}i:before{content:" ▼ "}i.is-collpsed:before{content:" ▶ "}i:after{content:attr(data-content)}i.is-collpsed+div{display:none}.c1{color:#293}.c2{color:#66d}.c3{color:#f12}.c4{color:#10c}.c3,.c4{font-weight:bold}'
			document.head.appendChild(tag)
			draw(str, body, first)
		}
	}
}()

