
/*!
 * Copyright (c) 2016-2024 Lauri Rooden
 * https://www.litejs.com/MIT-LICENSE.txt
 */


!function(body) {
	var jsonp
	, jsonRe = /^\s*(?:\[\s*(?=-?\d|true|false|null|["[{])[^]*\]|\{\s*"[^]+\})\s*$/
	, str = body && body.firstChild && (body.firstChild.tagName === "PRE" ? body.firstChild : body).innerHTML

	if (str && (
		/\bjson\b/i.test(document.contentType) ||
		jsonRe.test(str) ||
		(jsonp = /^([\/*&;='"$\w\s]{0,99}\b[$a-z_][$\w]{0,99}\s*\()([^]+)(\)[\s;]*)$/i.exec(str)) && jsonRe.test(jsonp[2])
	)) {
		var display = body.style.display
		body.style.display = "none"
		;(this.chrome || this.browser).runtime.sendMessage({op: "formatBody", len: str.length}, function() {
			body.style.display = display
		})
	}
}(document.body)

