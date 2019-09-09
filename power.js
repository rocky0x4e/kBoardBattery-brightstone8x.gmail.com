const Lang = imports.lang;
const { Clutter, Gio, St, UPowerGlib: UPower } = imports.gi;
const BaseIndicator = imports.ui.status.power.Indicator;
const Power = imports.ui.status.power

const PowerManagerProxy = Gio.DBusProxy.makeProxyWrapper(Power.DisplayDeviceInterface);

var kb ;

var Indicator = class extends BaseIndicator {

	constructor(){
		log("[k2 batt] findKeyboard");
		let upowerClient = imports.gi.UPowerGlib.Client.new_full(null);
		let devices = upowerClient.get_devices();
		let i;
		for (i=0; i < devices.length; i++){
			let objPath = devices[i].get_object_path();
			if (objPath.includes("keyboard_hid_")){
				kb = devices[i];
			}
		}
		super();
		this._proxy = new PowerManagerProxy(Gio.DBus.system,
											'org.freedesktop.UPower',
											kb.get_object_path(),
                                            (proxy, error) => {
                                                if (error) {
                                                    log(error.message);
                                                    return;
                                                }
                                                this._proxy.connect('g-properties-changed',
                                                                    this._sync.bind(this));
                                                this._sync();
                                            });
	}
	
   _getBatteryStatus() {
		log("[k2 batt] read battery info");
		kb.refresh_sync(null);
		if (kb.has_statistics) {
			let percentage = "KChron " + kb.percentage +"%";
			return percentage;
		} else {
			return "N/A";
		}
   }

   _sync() {
      super._sync();
      this._percentageLabel.clutter_text.set_markup('<span size="smaller">' + this._getBatteryStatus() + '</span>');
   }
}
