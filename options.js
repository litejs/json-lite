
/*!
 * Copyright (c) 2016-2018 Lauri Rooden
 * https://www.litejs.com/MIT-LICENSE.txt
 */


var themes = {
	"": {
		font: "13px Menlo,monospace",
		color: "#000",
		bg: "#fff",
		info: "#ccc",
		infoHover: "#333;text-shadow: 1px 1px 3px #999",
		numCol: "#333",
		numBg: "#ccc",
		string: "#293",
		number: "#10c",
		bool: "#10c",
		null: "#10c",
		property: "#66d",
		error: "#f12"
	},
	"firefox-dark": {
		font: "13px Menlo,monospace",
		color: "#fff",
		bg: "#181d20",
		info: "#888",
		infoHover: "#ccc",
		numCol: "#ccc",
		numBg: "#333",
		string: "#df80ff",
		number: "#70bf53",
		bool: "#70bf53",
		null: "#747573",
		property: "#46afe3",
		error: "#ed2655"
	}
}

// In Safari async storage.get in previous script completes before this script get executed
// In Chrome and Firefox this script executes before storage.get completes
if (opts) init()
else next = init

function init() {
	theme.value = themes[opts.theme] ? opts.theme : "custom"
	updateForm(opts)
}

function updateForm(items) {
	if (items) Object.keys(defOpts).forEach(function(key) {
		if (key !== "theme" && items[key] != null) {
			if (form1[key].type === "checkbox") form1[key].checked = items[key]
			else form1[key].value = items[key]
		}
	})

	custom.style.display = theme.value === "custom" ? "block" : "none"
	dateOpt.style.display = showDate.value !== "never" ? "block" : "none"
}

function saveOptions(e) {
	e.preventDefault()
	storage.set(Object.keys(defOpts).reduce(function(map, key) {
		map[key] = form1[key][form1[key].type === "checkbox" ? "checked" : "value"]
		return map
	}, {}))
	window.close()
}

form1.addEventListener("submit", saveOptions)
theme.addEventListener("change", function() {
	updateForm(themes[theme.value])
})
showDate.addEventListener("change", function() {
	updateForm()
})

if (location.search !== "?p") pre.style.display = "none"
pre.addEventListener("click", function(e) {
	var el = e.target || e.srcElement
	if (el.nodeType == 3) el = el.parentNode
	var prom = chrome.runtime.sendMessage({op: el.name}, close)
	if (prom) prom.then(close, close)
})


