const Lang = imports.lang;
const { St, Gio, UPowerGlib: UPower } = imports.gi;
const Power = imports.ui.status.power
const PowerManagerProxy = Gio.DBusProxy.makeProxyWrapper(Power.DisplayDeviceInterface);
const BUS_NAME = 'org.freedesktop.UPower';
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Clutter    = imports.gi.Clutter;

const findKeyboard = () => {
	Log("findKeyboard");
	var upowerClient = UPower.Client.new_full(null);
	var devices = upowerClient.get_devices();
	let i;
	for (i=0; i < devices.length; i++){
		if (devices[i].kind == UPower.DeviceKind.KEYBOARD){
			return devices[i];
		}
	}
}

const kBattIndicator = new Lang.Class({

	Name : "BtKeybBattIndicator",
	Extends: PanelMenu.Button,

	_init: function () {
		Log("Init kBattIndicator");

		this.parent(0.0, "BtKeybBattIndicator");

		let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box bt-keyb-batt-hbox' });
		this.icon = new St.Icon({ icon_name: 'input-keyboard',
					 style_class: 'system-status-icon bt-keyb-batt-icon' });
		hbox.add_child(this.icon);

		this.buttonText = new St.Label({
				text: _('%'),
				y_align: Clutter.ActorAlign.CENTER,
				x_align: Clutter.ActorAlign.START
		});
		hbox.add_child(this.buttonText);

		this.actor.add_child(hbox);

		this.entryItem = new PopupMenu.PopupMenuItem("-- N/A --");
		this.menu.addMenuItem(this.entryItem);

		this.keyboard = this.findKeyboard();
		this._newProxy();
	},

	findKeyboard : function () {
		Log("findKeyboard");
		let upowerClient = UPower.Client.new_full(null);
		let devices = upowerClient.get_devices();
		let i;
		for (i=0; i < devices.length; i++){
			if (devices[i].kind == UPower.DeviceKind.KEYBOARD){
				Log("Found: " + devices[i].model + " | " + devices[i].native_path);
				return devices[i];
			}
		}
	},

	_sync : function () {
		Log("_sync: begin" )
		let text;
		try {
			var percent = this.getBatteryStatus();
			Log("_sync: " + this.keyboard.model + " | " + this.keyboard.native_path);
			text = this.keyboard.model+ ": " + percent;
			this.entryItem.label.set_text(text);
			this.buttonText.set_text(percent);
		} catch (err) {
			Log("no batt found ");
			Log(err.message);
			text = "n/a";
		}
		Log(text);
	},

	getBatteryStatus : function () {
		Log("read battery info");
		try {
			this.keyboard.refresh_sync(null);
		} catch (err) {
			Log("WTF: " + err.message);
		}
		let percentage = this.keyboard.percentage +"%";
		Log(percentage);
		return percentage;
	},

	_newProxy : function(){
		Log("Create new DBusProxy");
		if (this.keyboard === undefined){
			Log("Too bad, so sad, no bluetooth keyboard's detected, no proxy");
		} else {
			if (this._proxy === undefined) {
				this._proxy = new	PowerManagerProxy(Gio.DBus.system,
									BUS_NAME,
									this.keyboard.get_object_path(),
									(proxy, error) => {
										if (error) {
											Log("PANIC");
															 Log(error.message);
															 return;
										}
										Log ("proxy callback");
										this._proxy.connect('g-properties-changed',
											this._sync.bind(this));
										this._sync();
								  }
								);
			} else {
				Log("Proxy existed");
			}
		}
	}
});

const Log = function(msg) {
	log ("[k2] " + msg);
}


