const ExtensionUtils = imports.misc.extensionUtils;
const BaTime = ExtensionUtils.getCurrentExtension();
const Panel = imports.ui.main.panel;

class K2Batt {
   constructor() {
      this.aggregateMenu = Panel.statusArea['aggregateMenu'];
      this.originalIndicator = this.aggregateMenu._power;
      this.customIndicator = new BaTime.imports.power.Indicator();
      this.aggregateMenu._indicators.replace_child(
         this.originalIndicator.indicators,
         this.customIndicator.indicators
      );
   }
   destroy() {
      this.aggregateMenu._indicators.replace_child(
         this.customIndicator.indicators,
         this.originalIndicator.indicators
      );
   }
}

let batt;

function enable() {
   batt = new K2Batt();
}

function disable() {
   batt.destroy();
   batt = null;
}
