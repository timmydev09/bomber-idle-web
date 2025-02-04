import UnityModule from "./unityModule.js";

class TonWebModule {

	async sendTon(args) {
		try {
			if (!tonConnectUI.connected) {
				await tonConnectUI.connectWallet();
			}

			const jsonData = JSON.parse(args.data);
			const cell = new TonWeb.boc.Cell();
			cell.bits.writeUint(0, 32);
			cell.bits.writeString(jsonData.payload);

			const base64payload = TonWeb.utils.bytesToBase64(await cell.toBoc());
			const transaction = {
				validUntil: jsonData.validUntil != 0 ? jsonData.validUntil : Math.floor(Date.now() / 1000) + 3600,
				messages: [
					{
						address: jsonData.address,
						amount: TonWeb.utils.toNano(jsonData.amount.toString()).toString(),
						payload: base64payload
					}
				]
			};

			const boc = await tonConnectUI.sendTransaction(transaction);
			const bocData = TonWeb.utils.base64ToBytes(boc.boc);
			const cellResp = TonWeb.boc.Cell.oneFromBoc(bocData);
			const hash = TonWeb.utils.bytesToBase64(await cellResp.hash());
			UnityModule.sendTaskCallback(args.taskId, true, hash);
		} catch (error) {
			UnityModule.sendTaskCallback(args.taskId, false, error)
		}
	}



	async sendJetton(args) {
		try {
			if (!tonConnectUI.connected) {
				await tonConnectUI.connectWallet();
			}
			const jsonData = JSON.parse(args.data);
			const sourceAddress = new TonWeb.utils.Address(tonConnectUI.wallet.account.address);
			const destinationAddress = new TonWeb.utils.Address(jsonData.destinationAddress);
			const comment = new Uint8Array([... new Uint8Array(4), ... new TextEncoder().encode(jsonData.comment)]);
			const cell = new TonWeb.boc.Cell();
			cell.bits.writeUint(0xf8a7ea5, 32); // opcode for jetton transfer
			cell.bits.writeUint(0, 64); // query id
			cell.bits.writeCoins(this.convertAmount(jsonData.amount, jsonData.token_decimals)); // store jetton amount
			cell.bits.writeAddress(destinationAddress); // TON wallet destination address
			cell.bits.writeAddress(sourceAddress); // response excess destination
			cell.bits.writeBit(false); // no custom payload
			cell.bits.writeCoins(TonWeb.utils.toNano('0')); // forward amount (if >0, will send notification message)
			cell.bits.writeBit(false); // we store forwardPayload as a reference
			cell.bits.writeBytes(comment);
			const payload = TonWeb.utils.bytesToBase64(await cell.toBoc());
			const transaction = {
				validUntil: Math.floor(Date.now() / 1000) + 3600,
				messages: [
					{
						address: jsonData.jettonWallet,
						amount: TonWeb.utils.toNano('0.05').toString(),
						payload: payload,
					},
				],
			};
			const result = await tonConnectUI.sendTransaction(transaction);
			const msgBody = TonWeb.utils.base64ToBytes(result.boc);
			const msgCell = TonWeb.boc.Cell.oneFromBoc(msgBody);
			const hash = TonWeb.utils.bytesToBase64(await msgCell.hash());
			UnityModule.sendTaskCallback(args.taskId, true, hash);
		} catch (error) {
			UnityModule.sendTaskCallback(args.taskId, false, error);
		}
	}

	convertAmount(amount, decimals) {
		return amount * Math.pow(10, decimals)
		// let comps = amount.toString().split(".");
		// let whole = comps[0];
		// let fraction = comps.length > 1 ? comps[1].substring(0, decimals) : "0";

		// if (!whole) whole = "0";
		// if (!fraction) fraction = "0";
		// while (fraction.length < decimals) fraction += "0";
		// whole = new TonWeb.utils.BN(whole);
		// fraction = new TonWeb.utils.BN(fraction);

		// const multiplier = new TonWeb.utils.BN(10).pow(new TonWeb.utils.BN(decimals));
		// return whole.mul(multiplier).add(fraction);
	}

	async stakeTon(args) {
		try {
			if (!tonConnectUI.connected) {
				await tonConnectUI.connectWallet();
			}
			const jsonData = JSON.parse(args.data);
			const cell = new TonWeb.boc.Cell();
			cell.bits.writeUint(3932984938, 32);
			const userAddress = new TonWeb.utils.Address(
				tonConnectUI.wallet.account.address
			);
			cell.bits.writeAddress(userAddress);
			const amount = this.convertAmount(jsonData.amount, jsonData.token_decimals) //jsonData.amount * Math.pow(10, jsonData.token_decimals)
			cell.bits.writeCoins(amount);
			const tokenAddress = new TonWeb.utils.Address(jsonData.tokenAddress);
			cell.bits.writeAddress(tokenAddress);
			cell.bits.writeUint(jsonData.orderId, 64);
			cell.bits.writeUint(jsonData.deadline, 64);
			const signatureCell = new TonWeb.boc.Cell();
			const bytesSignature = TonWeb.utils.base64ToBytes(jsonData.signature);
			signatureCell.bits.writeBytes(bytesSignature);
			cell.refs.push(signatureCell); //Signature

			const payload = TonWeb.utils.bytesToBase64(await cell.toBoc());
			const transaction = {
				validUntil: Math.floor(Date.now() / 1000) + 360,
				messages: [
					{
						address: jsonData.contractAddress,
						amount: TonWeb.utils.toNano((jsonData.amount + 0.1).toString()).toString(),
						payload: payload,
					},
				],
			};
			const result = await tonConnectUI.sendTransaction(transaction);
			const msgBody = TonWeb.utils.base64ToBytes(result.boc);
			const msgCell = TonWeb.boc.Cell.oneFromBoc(msgBody);
			const hash = TonWeb.utils.bytesToBase64(await msgCell.hash());
			UnityModule.sendTaskCallback(args.taskId, true, hash);
		} catch (err) {
			UnityModule.sendTaskCallback(args.taskId, false, err)
		}
	}

	async withdraw(args) {
		try {
			if (!tonConnectUI.connected) {
				await tonConnectUI.connectWallet();
			}
			const jsonData = JSON.parse(args.data);
			const userAddress = new TonWeb.utils.Address(
				tonConnectUI.wallet.account.address
			);
			const tokenAddress = new TonWeb.utils.Address(jsonData.tokenAddress);

			const cell = new TonWeb.boc.Cell();
			cell.bits.writeUint(1931016268, 32);
			cell.bits.writeAddress(userAddress);
			const amount = this.convertAmount(jsonData.amount, jsonData.token_decimals)
			cell.bits.writeCoins(amount);
			cell.bits.writeAddress(tokenAddress);
			cell.bits.writeUint(jsonData.orderId, 64);
			cell.bits.writeUint(jsonData.deadline, 64);
			const signatureCell = new TonWeb.boc.Cell();
			const bytesSignature = TonWeb.utils.base64ToBytes(jsonData.signature);
			signatureCell.bits.writeBytes(bytesSignature);
			cell.refs.push(signatureCell); //Signature

			const payload = TonWeb.utils.bytesToBase64(await cell.toBoc());
			const transaction = {
				validUntil: Math.floor(Date.now() / 1000) + 360,
				messages: [
					{
						address: jsonData.contractAddress,
						amount: TonWeb.utils.toNano("0.05").toString(),
						payload: payload,
					},
				],
			};
			const result = await tonConnectUI.sendTransaction(transaction);
			const msgBody = TonWeb.utils.base64ToBytes(result.boc);
			const msgCell = TonWeb.boc.Cell.oneFromBoc(msgBody);
			const hash = TonWeb.utils.bytesToBase64(await msgCell.hash());
			UnityModule.sendTaskCallback(args.taskId, true, hash);
		} catch (err) {
			UnityModule.sendTaskCallback(args.taskId, false, err)
		}
	}
	async claimTon(args) {
		try {
			if (!tonConnectUI.connected) {
				await tonConnectUI.connectWallet();
			}
			const jsonData = JSON.parse(args.data);
			const userAddress = new TonWeb.utils.Address(tonConnectUI.wallet.account.address);
			const tokenAddress = new TonWeb.utils.Address(jsonData.tokenAddress);

			const cell = new TonWeb.boc.Cell();
			cell.bits.writeUint(3271320869, 32); //claim op code
			cell.bits.writeAddress(userAddress); //Receiver address

			const amount = this.convertAmount(jsonData.amount, jsonData.token_decimals)
			cell.bits.writeCoins(amount); //Amount
			cell.bits.writeAddress(tokenAddress); //token address
			cell.bits.writeUint(Number(jsonData.orderId), 64); //txId
			cell.bits.writeUint(jsonData.deadline, 64); //Deadline

			const signatureCell = new TonWeb.boc.Cell();
			const bytesSignature = TonWeb.utils.base64ToBytes(jsonData.signature);
			signatureCell.bits.writeBytes(bytesSignature);
			cell.refs.push(signatureCell); //Signature



			const payload = TonWeb.utils.bytesToBase64(await cell.toBoc());
			const transaction = {
				validUntil: Math.floor(Date.now() / 1000) + 360,
				messages: [
					{
						address: jsonData.contractAddress,
						amount: TonWeb.utils.toNano("0.05").toString(), // 0.01
						payload: payload,
					},
				],
			};

			transaction.validUntil = Math.floor(Date.now() / 1000) + 3600;
			const result = await tonConnectUI.sendTransaction(transaction);
			const msgBody = TonWeb.utils.base64ToBytes(result.boc);
			const msgCell = TonWeb.boc.Cell.oneFromBoc(msgBody);
			const hash = TonWeb.utils.bytesToBase64(await msgCell.hash());
			UnityModule.sendTaskCallback(args.taskId, true, hash);
		} catch (err) {
			UnityModule.sendTaskCallback(args.taskId, false, err)
		}
	}
	async claimBonus(args) {
		try {
			if (!tonConnectUI.connected) {
				await tonConnectUI.connectWallet();
			}
			const jsonData = JSON.parse(args.data);
			const userAddress = new TonWeb.utils.Address(
				tonConnectUI.wallet.account.address
			);

			const cell = new TonWeb.boc.Cell();
			cell.bits.writeUint(3271320869, 32); //claim op code

			const signatureCell = new TonWeb.boc.Cell();
			const bytesSignature = TonWeb.utils.base64ToBytes(jsonData.signature);
			signatureCell.bits.writeBytes(bytesSignature);
			cell.refs.push(signatureCell); //Signature

			const tokenAddress = new TonWeb.utils.Address(jsonData.tokenAddress);
			cell.bits.writeAddress(userAddress); //Receiver address
			cell.bits.writeAddress(tokenAddress); //token address

			const amount = this.convertAmount(jsonData.amount, jsonData.token_decimals)
			cell.bits.writeCoins(amount); //Amount
			cell.bits.writeUint(jsonData.deadline, 64); //Deadline
			cell.bits.writeUint(Number(jsonData.orderId), 64); //txId

			const payload = TonWeb.utils.bytesToBase64(await cell.toBoc());
			const transaction = {
				messages: [
					{
						address: jsonData.contractAddress,
						amount: TonWeb.utils.toNano("0.05").toString(),
						payload: payload,
					},
				],
			};

			transaction.validUntil = Math.floor(Date.now() / 1000) + 3600;
			const result = await tonConnectUI.sendTransaction(transaction);
			const msgBody = TonWeb.utils.base64ToBytes(result.boc);
			const msgCell = TonWeb.boc.Cell.oneFromBoc(msgBody);
			const hash = TonWeb.utils.bytesToBase64(await msgCell.hash());
			UnityModule.sendTaskCallback(args.taskId, true, hash);
		} catch (err) {
			UnityModule.sendTaskCallback(args.taskId, false, err)
		}
	}

	async stakeJetton(args) {
		try {
			if (!tonConnectUI.connected) {
				await tonConnectUI.connectWallet();
			}
			const jsonData = JSON.parse(args.data);

			const userAddress = new TonWeb.utils.Address(
				tonConnectUI.wallet.account.address
			);
			const cell = new TonWeb.boc.Cell();
			cell.bits.writeUint(260734629, 32);
			cell.bits.writeUint(0, 64); // query id
			const amount = this.convertAmount(jsonData.amount, jsonData.token_decimals)
			console.log(`stake amount: ${amount}`)
			cell.bits.writeCoins(amount);
			cell.bits.writeAddress(
				new TonWeb.utils.Address(jsonData.contractAddress)
			);
			cell.bits.writeAddress(userAddress);
			cell.bits.writeBit(false); // no custom payload
			cell.bits.writeCoins(TonWeb.utils.toNano("0.1")); // forward amount (if >0, will send notification message)

			cell.bits.writeBit(true); // we store forwardPayload as a reference
			const forwardCell = new TonWeb.boc.Cell();
			forwardCell.bits.writeUint(3932984938, 32);

			forwardCell.bits.writeAddress(userAddress);
			forwardCell.bits.writeCoins(amount);
			forwardCell.bits.writeAddress(jsonData.tokenAddress);
			forwardCell.bits.writeUint(jsonData.orderId, 64);
			forwardCell.bits.writeUint(jsonData.deadline, 64);

			const signatureCell = new TonWeb.boc.Cell();
			const bytesSignature = TonWeb.utils.base64ToBytes(jsonData.signature);
			signatureCell.bits.writeBytes(bytesSignature);
			forwardCell.refs.push(signatureCell); //Signature
			cell.refs.push(forwardCell);

			const payload = TonWeb.utils.bytesToBase64(await cell.toBoc());
			const transaction = {
				validUntil: Math.floor(Date.now() / 1000) + 360,
				messages: [
					{
						address: jsonData.userJettonWallet, //jetton
						amount: TonWeb.utils.toNano("0.05").toString(),
						payload: payload,
					},
				],
			};
			const result = await tonConnectUI.sendTransaction(transaction);
			const msgBody = TonWeb.utils.base64ToBytes(result.boc);
			const msgCell = TonWeb.boc.Cell.oneFromBoc(msgBody);
			const hash = TonWeb.utils.bytesToBase64(await msgCell.hash());
			UnityModule.sendTaskCallback(args.taskId, true, hash);
		} catch (err) {
			UnityModule.sendTaskCallback(args.taskId, false, err)
		}
	}
}

export default new TonWebModule;
