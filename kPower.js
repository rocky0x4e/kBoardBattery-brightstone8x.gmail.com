const Lang = imports.lang;
const { St, Gio, UPowerGlib: UPower } = imports.gi;
const BaseIndicator = imports.ui.status.power.Indicator;
const Power = imports.ui.status.power
const PowerManagerProxy = Gio.DBusProxy.makeProxyWrapper(Power.DisplayDeviceInterface);
const BUS_NAME = 'org.freedesktop.UPower';

var kb;
const findKeyboard = () => {
	Log("findKeyboard");
	let upowerClient = UPower.Client.new_full(null);
	let devices = upowerClient.get_devices();
	let i;
	for (i=0; i < devices.length; i++){
		if (devices[i].kind == UPower.DeviceKind.KEYBOARD){
			return devices[i];
		}
	}
}

const kBattIndicator = new Lang.Class({

	Name : "Keychron Battery Indicator", 

	_init: function () {
		this.keyboard = this.findKeyboard();
		this.indicator = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
		this.icon = new St.Icon({ icon_name: 'input-keyboard',
					 style_class: 'system-status-icon' });

		this.indicator.set_child(this.icon);
		
		this.proxy = Gio.DBusProxy();
	},

	findKeyboard : function () {
		Log("findKeyboard");
		let upowerClient = UPower.Client.new_full(null);
		let devices = upowerClient.get_devices();
		let i;
		for (i=0; i < devices.length; i++){
			if (devices[i].kind == UPower.DeviceKind.KEYBOARD){
				return devices[i];
			}
		}
	},
	
	sync : function () {
		Log("_sync: begin" )
		let text;
		try {
			Log("_sync: " + this.keyboard.model + " | " + this.keyboard.native_path);
			text = this.keyboard.model+ ": " + this.getBatteryStatus(this.keyboard);
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
	}
});

const Log = function(msg) {
	log ("[k2] " + msg);
}
//~ -----------------------------------------------------------
let button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
                          
let  Indicator = class extends BaseIndicator {
	constructor(){
		Log("new indicator");
		kb = findKeyboard();

		super();

		let icon = new St.Icon({ icon_name: 'input-keyboard',
                             style_class: 'system-status-icon' });
		button.set_child(icon);

		this._proxy = new PowerManagerProxy(Gio.DBus.system,
									BUS_NAME,
									kb.get_object_path(),
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
		Log("new indicator : DONE");

	}

   _getBatteryStatus(kb) {
		Log("read battery info");
		try {
			kb.refresh_sync(null);
		} catch (err) {
			Log("WTF: " + err.message);
		}
		let percentage = kb.percentage +"%";
		Log("" + percentage);
		return percentage;
   }

   _sync() {
	   Log("_sync: begin" )
	   let text;
		try {
			Log("_sync: " + kb.model + " | " + kb.native_path);
			text = kb.model+ ": " + this._getBatteryStatus(kb);
		} catch (err) {
			Log("no batt found ");
			Log(err.message);
			text = "n/a";
		}
		Log(text);
   }
}
