class UnityModule {
	init() {
		document.addEventListener("visibilitychange", function () {
			unityGame.SendMessage("UnityBridge", "OnVisibilityChange", document.visibilityState);
		});
	}

	getData(data) {
		return (typeof data === 'object' && data !== null) ? JSON.stringify(data) : typeof data !== 'undefined' ? data.toString() : '';
	}

	sendTaskCallback(taskId, success, data) {
		var params = {
			id: taskId,
			success: success,
			data: this.getData(data)
		};
		unityGame.SendMessage("UnityBridge", "ExecuteCallback", JSON.stringify(params));
	}

	setLoadingProgress(args) {
		var progress = args.progress;
		var loadingBar = document.querySelector("#unity-loading-fg");
		loadingBar.style.width = 100 * args.progress + "%";

		if (progress == 1) {
			var loadingContainer = document.querySelector("#unity-loading-container");
			loadingContainer.classList.add("finished");
		}
	}

	setLoadingText(args) {
		var loadingText = document.querySelector("#unity-loading-text");
		loadingText.innerHTML = args.text;
	}

	copyToClipboard(args) {
		ClipboardJS.copy(args.text);
	}

	reload() {
		location.reload();
	}

	isProduction() {
		var host = window.location.host;
		var isProduction = host.indexOf("client.mergepals.io") > -1 || host.indexOf("client-world-app.mergepals.io") > -1;
		return this.getData(isProduction);
	}
}

export default new UnityModule;
