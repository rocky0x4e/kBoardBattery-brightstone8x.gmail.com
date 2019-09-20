const ExtensionUtils = imports.misc.extensionUtils;
const localLib = ExtensionUtils.getCurrentExtension().imports.kPower;
const Log = localLib.Log;
const Panel = imports.ui.main.panel;

class KBatt {
   constructor() {
		Log("test indicator");
		this.test = new localLib.kBattIndicator();
		
		Log("new kbatt");
		this.customIndicator = new localLib.Indicator();
		Panel._rightBox.insert_child_at_index(localLib.button,0);
   }
   destroy() {
		Log("destroy");
		Panel._rightBox.remove_child(localLib.button);
		this.customIndicator.destroy();
   }
}

let keyboard;

function enable() {
	Log("enable");
	keyboard = new KBatt();
}

function disable() {
   keyboard.destroy();
   keyboard = null;
}
