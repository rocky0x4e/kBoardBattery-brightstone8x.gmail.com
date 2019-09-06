const Lang = imports.lang;
const BaseIndicator = imports.ui.status.power.Indicator;

var Indicator = class extends BaseIndicator {
   _getBatteryStatus() {
	   log("get battery status"); 
	    var UPower = new imports.gi.UPowerGlib.Device();
		UPower.set_object_path_sync("/org/freedesktop/UPower/devices/keyboard_hid_dco2co26ocdo21o79_battery", null);
		UPower.refresh_sync(null);
	    var percentage = UPower.percentage + '%';
		this._percentageLabel.visible = true;

		if (!UPower.has_statistics){
			return "Pending...";
		}

        return _("%s").format(percentage);
      }

   _sync() {
	  log("_sync")
      super._sync();
      this._percentageLabel.clutter_text.set_markup('<span size="smaller">' + this._getBatteryStatus() + '</span>');
   }
}
