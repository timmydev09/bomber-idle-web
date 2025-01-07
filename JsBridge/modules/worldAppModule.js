import UnityModule from "./unityModule.js";

class WorldAppModule {
	isInstalled(args) {
		var isInstalled = WorldAppMiniKit && WorldAppMiniKit.isInstalled();
		return `${isInstalled}`;
	}

	getAppId(args) {
		return WorldAppMiniKit.appId;
	}

	getWalletAddress(args) {
		return WorldAppMiniKit.walletAddress;
	}

	async verify(args) {
		const { finalPayload } = await WorldAppMiniKit.commandsAsync.verify({
			action: UTF8ToString(args.action), // This is your action ID from the Developer Portal
			signal: UTF8ToString(args.signal), // Optional additional data
			verification_level: "device", // Orb | Device
		});

		UnityModule.sendTaskCallback(args.taskId, finalPayload.status !== "error", finalPayload);
	}

	async authByWallet(args) {
		const now = new Date().getTime();
		const { commandPayload: generateMessageResult, finalPayload } =
			await WorldAppMiniKit.commandsAsync.walletAuth({
				nonce: args.nonce,
				requestId: args.request_id,
				expirationTime: new Date(now + 7 * 24 * 60 * 60 * 1000),
				notBefore: new Date(now - 24 * 60 * 60 * 1000),
				statement: args.statement,
			});

		UnityModule.sendTaskCallback(args.taskId, finalPayload.status === "success", finalPayload);
	}
	
	async pay(args){
		const tokens = args.tokens.map((token) => ({
			symbol: token.symbol,
			token_amount: tokenToDecimals(token.token_amount, "WLD").toString(),
		}));
		const { finalPayload } = await WorldAppMiniKit.commandsAsync.pay({
			reference: args.reference,
			to: args.to,
			tokens: tokens,
			description: args.description,
		});
		UnityModule.sendTaskCallback(
			args.taskId,
			finalPayload.status === "success",
			finalPayload
		);
	}
}

export default new WorldAppModule;
