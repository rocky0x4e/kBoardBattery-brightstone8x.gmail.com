const ExtensionUtils = imports.misc.extensionUtils;
const localLib = ExtensionUtils.getCurrentExtension();
const Panel = imports.ui.main.panel;

class KBatt {
   constructor() {
		log("[k2 batt] new kbatt");

		this.customIndicator = new localLib.imports.kPower.Indicator();
		Panel._rightBox.insert_child_at_index(localLib.imports.kPower.button,0);
   }
   destroy() {
		log("[k2 batt] destroy");
		Panel._rightBox.remove_child(localLib.imports.kPower.button);
		this.customIndicator.destroy();
   }
}

let keyboard;

function enable() {
	log("[k2 batt] enable");
	keyboard = new KBatt();
}

function disable() {
   keyboard.destroy();
   keyboard = null;
}
