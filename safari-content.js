
if (!this.chrome) {
	this.chrome = {
		runtime: {
			sendMessage: function(message, cb) {
				safari.self.tab.dispatchMessage("x", message)
				cb()
			}
		}
	}
	safari.self.addEventListener("message", function(e) {
		if (e.name === "insertCSS") {
			var el = document.createElement("style")
			el.textContent = e.message
			document.head.appendChild(el)
		} else if (e.name === "executeScript") {
			eval(e.message)
		}
	}, false)
}
