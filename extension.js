const ExtensionUtils = imports.misc.extensionUtils;
const kPower = ExtensionUtils.getCurrentExtension().imports.kPower;
const Log = kPower.Log;
const Main = imports.ui.main;

var btKeybBattIndicator;
function enable() {
	Log("enable");
	btKeybBattIndicator = new kPower.kBattIndicator();
	Main.panel.addToStatusArea('BtKeybBattIndicator', btKeybBattIndicator, 1);
}

function disable() {
	Log("Disable");
	kPower.dbusCon.signal_unsubscribe(btKeybBattIndicator.subIdAdd);
	kPower.dbusCon.signal_unsubscribe(btKeybBattIndicator.subIdRem);
	btKeybBattIndicator._proxy = null;
	btKeybBattIndicator.reset();
	btKeybBattIndicator.destroy();
	btKeybBattIndicator = null;
}
