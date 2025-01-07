import UnityModule from "./unityModule.js";

class TelegramModule {
	getInitData() {
		if (typeof Telegram === 'undefined') return "";
		return Telegram.WebApp.initData;
	}

	openLink(args) {
		var url = args.url;
		if (typeof Telegram === 'undefined') {
			window.open(url);
			return;
		}
		if (url.startsWith("https://t.me")) {
			Telegram.WebApp.openTelegramLink(url);
		} else {
			Telegram.WebApp.openLink(url);
		}
	}

	addToHomeScreen(args) {
		try {
			Telegram.WebApp.addToHomeScreen();
			Telegram.WebApp.checkHomeScreenStatus(status => {
				var isAdded = status == "added" || status == "unknown";
				UnityModule.sendTaskCallback(args.taskId, true, isAdded);
			});
		} catch (error) {
			UnityModule.sendTaskCallback(args.taskId, true, false);
		}
	}

	setEmojiStatus(args) {
		try {
			Telegram.WebApp.setEmojiStatus("6095835817513586939", null, status => {
				UnityModule.sendTaskCallback(args.taskId, true, status);
			});
		} catch (error) {
			UnityModule.sendTaskCallback(args.taskId, true, false);
		}
	}

	openInvoice(args) {
		Telegram.WebApp.openInvoice(args.url, status => {
			var isPaid = status == "paid";
			UnityModule.sendTaskCallback(args.taskId, isPaid, isPaid);
		});
	}

	shareStory(args) {
		var mediaUrl = args.mediaUrl;
		var text = args.text;
		var widgetUrl = args.widgetUrl;
		var widgetName = args.widgetName;

		try {
			Telegram.WebApp.shareToStory(mediaUrl, {
				text: text,
				widget_link: {
					url: widgetUrl,
					name: widgetName
				}
			});
			return "true";
		}
		catch (error) {
			return "false";
		}
	}

	getLocation(args) {
		try {
			var locationManager = Telegram.WebApp.LocationManager;
			var getLocation = () => {
				locationManager.getLocation((location) => {
					if (location !== null) {
						UnityModule.sendTaskCallback(args.taskId, true, location);
					}
					else {
						UnityModule.sendTaskCallback(args.taskId, false, "{}");
					}
				});
			}

			if (!locationManager.isInited) {
				locationManager.init(() => {
					getLocation();
				});
			}
			else {
				getLocation();
			}
		}
		catch (error) {
			UnityModule.sendTaskCallback(args.taskId, false, "{}");
		}
	}

	isMobile() {
		var platform = Telegram.WebApp.platform;
		return `${(platform === "android" || platform === "ios")}`;
	};
}

export default new TelegramModule;
