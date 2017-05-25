
var chrome = this.chrome || this.browser
, storage = chrome.storage && (chrome.storage.sync || chrome.storage.local)
, themes = {
	"": {
		theme: "",
		font: "13px Menlo,monospace",
		bg: "#fff",
		info: "#ccc",
		infoHover: "#333;text-shadow: 1px 1px 3px #999",
		string: "#293",
		number: "#10c",
		property: "#66d",
		error: "#f12"
	}
}

function loadOptions() {
	storage.get(themes[""], function(items) {
		theme.value = items.theme || ""
		updateForm(items)
	})
}

function updateForm(items) {
	custom.style.display = theme.value === "custom" ? "block" : "none"

	if (items) Object.keys(themes[""]).forEach(function(key) {
		if (key !== theme) form1[key].value = items[key]
	})
}

function saveOptions(e) {
	e.preventDefault()
	storage.set(Object.keys(themes[""]).reduce(function(map, key) {
		map[key] = form1[key].value
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

