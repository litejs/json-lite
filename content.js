
!function() {
	function units(size) {
		return size > 1048576 ? (0|(size / 1048576)) + " MB " :
		size > 1024 ? (0|(size / 1024)) + " KB " :
		size + " bytes "
	}

	function draw(str, to, first) {
		var tmp, match, val
		, re = /(")(?:\\?.)*?"|(-?[\d.]+)|true|false|null|[[\]{},:]/g
		, node = document.createElement("div")
		, span = document.createElement("span")
		, comm = document.createElement("i")
		, path = []
		, cache = {
			"{": fragment("{", "}"),
			"[": fragment("[", "]"),
			",": fragment(","),
			":": document.createTextNode(": ")
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
			var target = e.target
			if (target.tagName == "I") {
				target.classList.toggle("is-collpsed")
			}
		}, true)

		to.replaceChild(node, first)
		loop(str, re)

		function loop(srt, re) {
			var ii = 0
			try {
				for (; match = re.exec(str); ) {
					val = match[0]
					if (val == "{" || val == "[") {
						path.push(node)
						node.appendChild(cache[val].cloneNode(true))
						node = node.lastChild.previousSibling
						node.len = 1
						node.start = re.lastIndex
					} else if (val == "}" || val == "]") {
						if (node.childNodes.length) {
							tmp = comm.cloneNode()
							tmp.dataset.content = node.len +
								(node.len == 1 ? " item, " : " items, ") +
								units(re.lastIndex - node.start + 1)
							node.parentNode.insertBefore(tmp, node)
						} else {
							node.parentNode.removeChild(node)
						}
						node = path.pop()
					} else if (val == ":") {
						node.appendChild(cache[val].cloneNode())
					} else if (val == ",") {
						node.len += 1
						node.appendChild(cache[val].cloneNode(true))
					} else {
						tmp = span.cloneNode()
						tmp.textContent = val
						tmp.className = match[1] ? "c2": "c1"
						node.appendChild(tmp)
					}
					if (++ii > 1000) {
						document.title = (0|(100*re.lastIndex/str.length)) + "% of " + units(str.length)
						setTimeout(function() {
							loop(str, re)
						}, 1)
						return
					}
				}
				document.title = ""
			} catch(e1) {
				to.className = "c3"
				try {
					JSON.parse(str)
					to.textContent = e1
				} catch (e2) {
					to.textContent = e2
				}
			}
		}
	}

	var str, chr
	, body = document.body
	, first = body && body.firstChild
	if (first && first == body.lastChild && first.tagName == "PRE") {
		str = first.textContent
		chr = str.charAt(0)
		if (chr == "{" || chr == "[") {
			var tag = document.createElement("style")
			tag.textContent = 'div{margin-left:4px;padding-left:1em;border-left:1px dotted #ccc;font:13px monospace}body>div{border:none}i{cursor:pointer;color:#ccc}i:hover{color:#999}i:before{content:" ▼ "}i:after{content:attr(data-content)}i.is-collpsed:before{content:" ▶ "}i.is-collpsed+div{display:none}.c1{color:#11c}.c2{color:#192}.c3{color:#f12}'
			document.head.appendChild(tag)
			draw(str, body, first)
		}
	}
}()

