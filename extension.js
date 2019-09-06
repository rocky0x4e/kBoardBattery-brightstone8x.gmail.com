const ExtensionUtils = imports.misc.extensionUtils;
const BaTime = ExtensionUtils.getCurrentExtension();
const Panel = imports.ui.main.panel;

class K2Batt {
   constructor() {
	   log ("Init K2Batt");
      this.aggregateMenu = Panel.statusArea['aggregateMenu'];
      this.originalIndicator = this.aggregateMenu._power;
      this.customIndicator = new BaTime.imports.power.Indicator();
      this.aggregateMenu._indicators.replace_child(
         this.originalIndicator.indicators,
         this.customIndicator.indicators
      );
   }
   destroy() {
	   log ("Destroy K2Batt");
      this.aggregateMenu._indicators.replace_child(
         this.customIndicator.indicators,
         this.originalIndicator.indicators
      );
   }
}

let batt;

function enable() {
	log ("Enable K2Batt");
   batt = new K2Batt();
}

function disable() {
   log ("Disable K2Batt");
   batt.destroy();
   batt = null;
}
