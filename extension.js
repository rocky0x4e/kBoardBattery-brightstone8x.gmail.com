const ExtensionUtils = imports.misc.extensionUtils;
const localLib = ExtensionUtils.getCurrentExtension().imports.kPower;
const Log = localLib.Log;
const Panel = imports.ui.main.panel;
const Main      = imports.ui.main;

let btKeybBattIndicator
function enable() {
	Log("enable");
	btKeybBattIndicator = new localLib.kBattIndicator();
	Main.panel.addToStatusArea('BtKeybBattIndicator', btKeybBattIndicator, 1);
}

function disable() {
	Log("Disable");
	btKeybBattIndicator._proxy = null;
   btKeybBattIndicator.destroy();
}
