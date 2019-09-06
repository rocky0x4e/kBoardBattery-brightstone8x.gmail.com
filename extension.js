const Lng = imports.lang
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Libs = ExtensionUtils.getCurrentExtension();
const Timers    = Libs.imports.timers;

let batt, button;
let kBatt = new imports.gi.UPowerGlib.Device();
let intervalID;

function init() {
	log(init);
	kBatt.set_object_path_sync("/org/freedesktop/UPower/devices/keyboard_hid_dco2co26ocdo21o79_battery", null);
	var percentage = kBatt.percentage;
	button = new Clutter.Text();
	button.set_text("K2: " + percentage +"%");
}

function enable() {
	Main.panel._rightBox.insert_child_at_index(button, 0);
	intervalID = Timers.setInterval(refresh, 120000);
}

function disable() {
	log("destroy");
	Main.panel._rightBox.remove_child(button);
	Timers.clearInterval(intervalID);
}

function refresh (){
	log("refresh");
	kBatt.refresh_sync(null);
	let percentage = kBatt.percentage;
	button.set_text("K2: " + percentage +"%");
	log("sleep 2min");
}
