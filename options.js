
/*!
 * Copyright (c) 2016-2018 Lauri Rooden
 * https://www.litejs.com/MIT-LICENSE.txt
 */


var chrome = this.chrome || this.browser
, storage = chrome.storage && (chrome.storage.sync || chrome.storage.local)
, themes = {
	"": {
		theme: "",
		font: "13px Menlo,monospace",
		color: "#000",
		bg: "#fff",
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
		newtab: false
	}
}

function loadOptions() {
	var got
	, promise = storage.get(themes[""], onGot)
	if (promise && promise.then) promise.then(onGot)

	function onGot(items) {
		if (got) return
		got = 1
		theme.value = items.theme || ""
		updateForm(items)
	}
}

function updateForm(items) {
	var el
	custom.style.display = theme.value === "custom" ? "block" : "none"

	if (items) Object.keys(themes[""]).forEach(function(key) {
		if (key !== "theme") {
			if (form1[key].type === "checkbox") form1[key].checked = items[key]
			else form1[key].value = items[key]
		}
	})
}

function saveOptions(e) {
	e.preventDefault()
	storage.set(Object.keys(themes[""]).reduce(function(map, key) {
		map[key] = form1[key][form1[key].type === "checkbox" ? "checked" : "value"]
		return map
	}, {}))
	window.close()
}

document.addEventListener("DOMContentLoaded", loadOptions)
form1.addEventListener("submit", saveOptions)
theme.addEventListener("change", function() {
	var items = themes[theme.value]
	updateForm(items)
})

