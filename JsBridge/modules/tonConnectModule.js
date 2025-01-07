import UnityModule from './unityModule.js';

class TonConnectModule {
	init(args) {
		if (typeof tonConnectUI === 'undefined') return;

		tonConnectUI.onStatusChange(wallet => {
			this.updateUserFriendlyAddress();
			return unityGame.SendMessage("UnityBridge", "WalletStatusChange", JSON.stringify(wallet));
		});

		if (tonConnectUI.wallet !== null) {
			this.updateUserFriendlyAddress();
			unityGame.SendMessage("UnityBridge", "WalletStatusChange", JSON.stringify(tonConnectUI.wallet));
		}
	};

	connect(args) {
		tonConnectUI.connectWallet()
			.then(data => UnityModule.sendTaskCallback(args.taskId, true, data))
			.catch(error => UnityModule.sendTaskCallback(args.taskId, false, error));
	};

	disconnect(args) {
		tonConnectUI.disconnect()
			.then(data => UnityModule.sendTaskCallback(args.taskId, true, data))
			.catch(error => UnityModule.sendTaskCallback(args.taskId, false, error));
	};

	updateUserFriendlyAddress() {
		if (tonConnectUI.wallet !== null) {
			tonConnectUI.wallet.account.userFriendlyAddress = new TonWeb.Address(tonConnectUI.wallet.account.address).toString(true, false, false, tonConnectUI.wallet.account.chain !== '-239');
		}
	}

	getWallet(args) {
		if (tonConnectUI.wallet !== null) {
			tonConnectUI.wallet.account.userFriendlyAddress = new TonWeb.Address(tonConnectUI.wallet.account.address).toString(true, false, false, tonConnectUI.wallet.account.chain !== '-239');
		}
		return JSON.stringify(tonConnectUI.wallet);
	};
}

export default new TonConnectModule;
