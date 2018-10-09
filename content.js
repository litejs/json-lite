
/*!
 * Copyright (c) 2016-2018 Lauri Rooden
 * https://www.litejs.com/MIT-LICENSE.txt
 */


!function() {
	var str, jsonpMatch
	, chrome = this.chrome || this.browser
	, jsonRe = /^\s*(?:\[\s*(?=-?\d|true|false|null|["[{])[^]*\]|\{\s*"[^]+\})\s*$/
	, body = document.body
	, first = body && body.firstChild

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
		body.style.display = "none"
		if (jsonpMatch) {
			body.textContent = jsonpMatch[3]
		}
		chrome.runtime.sendMessage({op: "formatBody", len: body.textContent.length}, function(response) {
			if (jsonpMatch) {
				body.insertBefore(document.createTextNode(jsonpMatch[1]), body.firstChild)
				body.appendChild(document.createTextNode(jsonpMatch[4]))
			}
			if (!response || response.op === "abort") {
				body.style.display = ""
				// body.appendChild(document.createElement("script")).textContent = "window.data=" + str
			}
		})
	}
}()

