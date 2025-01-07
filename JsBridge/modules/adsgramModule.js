import UnityModule from "./unityModule.js";

class AdsgramModule {
	show(args) {
		let controller = Adsgram.init({ blockId: `${args.blockId}` });
		controller.show().then(data => {
			UnityModule.sendTaskCallback(args.taskId, true, data);
		}).catch(data => {
			UnityModule.sendTaskCallback(args.taskId, false, data);
		})
	}
}

export default new AdsgramModule;
