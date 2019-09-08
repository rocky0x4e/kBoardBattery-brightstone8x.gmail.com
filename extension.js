const Lng = imports.lang
const St = imports.gi.St;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Libs = ExtensionUtils.getCurrentExtension();
var Timers  = Libs.imports.timers;
var battText;
var kBatt = new imports.gi.UPowerGlib.Device();
var intervalID;

function init() {
	log("[K2 batt] init");
	kBatt.set_object_path_sync("/org/freedesktop/UPower/devices/keyboard_hid_dco2co26ocdo21o79_battery", null);
	let Color = new imports.gi.Clutter.Color({red:0, blue:0, green:255, alpha:255});
	battText = new Clutter.Text(Color);
	battText.set_color(Color);
}

function enable() {
	log("[K2 batt] enable");
	Main.panel._rightBox.insert_child_at_index(battText, 0);
	readBatt();
	intervalID = Timers.setInterval(readBatt, 120000);
}

function disable() {
	log("[K2 batt] destroy");
	Main.panel._rightBox.remove_child(battText);
	Timers.clearInterval(intervalID);
}

function readBatt (){
	log("[K2 batt] read battery info");
	kBatt.refresh_sync(null);
	if (kBatt.has_statistics) {
		let percentage = kBatt.percentage;
		battText.set_text("K2: " + percentage +"%");
	} else {
		battText.set_text("K2: N/A");
	}
	log("[K2 batt] sleep 2min");
}
