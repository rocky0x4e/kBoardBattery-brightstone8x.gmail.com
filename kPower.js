const Lang = imports.lang;
const { St, Gio, UPowerGlib: UPower } = imports.gi;
const BaseIndicator = imports.ui.status.power.Indicator;
const Power = imports.ui.status.power
const PowerManagerProxy = Gio.DBusProxy.makeProxyWrapper(Power.DisplayDeviceInterface);
const BUS_NAME = 'org.freedesktop.UPower';

var kb;
const findKeyboard = () => {
	log("[k2 batt] findKeyboard");
	let upowerClient = UPower.Client.new_full(null);
	let devices = upowerClient.get_devices();
	let i;
	for (i=0; i < devices.length; i++){
		if (devices[i].kind == UPower.DeviceKind.KEYBOARD){
			return devices[i];
		}
	}
}

let button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });

let Power = class extends PowerManagerProxy {
	constructor(){
		super();
		this.g_connection = Gio.DBus.system;
		this.g_interface_name = BUS_NAME;
		//this.g_interface_info = info;
		//this.g_name= name;
		this.g_object_path = kb.get_object_path();
	}
   _getBatteryStatus(kb) {
		log("[k2 batt] read battery info");
		try {
			kb.refresh_sync(null);
		} catch (err) {
			log("[k2 batt] WTF: " + err.message);
		}
		let percentage = kb.percentage +"%";
		log("[k2 batt] " + percentage);
		return percentage;
   }

	_sync() {
	   log("[k2 batt] _sync: begin" )
	   let text;
		try {
			log("[k2 batt] _sync: " + kb.model + " | " + kb.native_path);
			text = kb.model+ ": " + this._getBatteryStatus(kb);
		} catch (err) {
			log("[k2 batt] no batt found ");
			log(err.message);
			text = "n/a";
		}
		log(text);

   }
}

let  Indicator = class extends BaseIndicator {
	constructor(){
		log("[k2 batt] new indicator");
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
											log("[k2 batt] PANIC");
															 log(error.message);
															 return;
										}
										log ("[k2 batt] proxy callback");
										this._proxy.connect('g-properties-changed',
											this._sync.bind(this));
										this._sync();
								  }
								);
		log("[k2 batt] new indicator : DONE");

	}

   _getBatteryStatus(kb) {
		log("[k2 batt] read battery info");
		try {
			kb.refresh_sync(null);
		} catch (err) {
			log("[k2 batt] WTF: " + err.message);
		}
		let percentage = kb.percentage +"%";
		log("[k2 batt] " + percentage);
		return percentage;
   }

   _sync() {
	   log("[k2 batt] _sync: begin" )
	   let text;
		try {
			log("[k2 batt] _sync: " + kb.model + " | " + kb.native_path);
			text = kb.model+ ": " + this._getBatteryStatus(kb);
		} catch (err) {
			log("[k2 batt] no batt found ");
			log(err.message);
			text = "n/a";
		}
		log(text);

   }
}
