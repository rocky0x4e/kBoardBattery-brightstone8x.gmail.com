const ExtensionUtils = imports.misc.extensionUtils;
const localLib = ExtensionUtils.getCurrentExtension();
const Panel = imports.ui.main.panel;

class KBatt {
   constructor() {
   log("[k2 batt] new");
      this.aggregateMenu = Panel.statusArea['aggregateMenu'];
      this.originalIndicator = this.aggregateMenu._power;
      this.customIndicator = new localLib.imports.power.Indicator();
      this.aggregateMenu._indicators.replace_child(
         this.originalIndicator.indicators,
         this.customIndicator.indicators
      );
   }
   destroy() {
		log("[k2 batt] destroy");
      this.aggregateMenu._indicators.replace_child(
         this.customIndicator.indicators,
         this.originalIndicator.indicators
      );
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
