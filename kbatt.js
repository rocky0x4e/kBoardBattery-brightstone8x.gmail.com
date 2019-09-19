const { Clutter, Gio, St, UPowerGlib: UPower } = imports.gi;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;


const BUS_NAME = 'org.freedesktop.UPower';

const xmlDeviceInterface = "";
const PowerManagerProxy = Gio.DBusProxy.makeProxyWrapper(xmlDeviceInterface);

const SHOW_BATTERY_PERCENTAGE       = 'show-battery-percentage';

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

var  Indicator = class extends PanelMenu.SystemIndicator {

	constructor(){
		log("[k2 batt] new indicator");
		kb = findKeyboard();
		
		super();
		this._desktopSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });
        this._desktopSettings.connect(`changed::${SHOW_BATTERY_PERCENTAGE}`,
                                      this._sync.bind(this));

        this._indicator = this._addIndicator();
        this._percentageLabel = new St.Label({ y_expand: true,
                                               y_align: Clutter.ActorAlign.CENTER });
        this.indicators.add(this._percentageLabel, { expand: true, y_fill: true });
        this.indicators.add_style_class_name('power-status');
        
		this._proxy = new PowerManagerProxy(Gio.DBus.system,
											BUS_NAME,
											kb.get_object_path(),
                                            (proxy, error) => {
                                                if (error) {
                                                    log(error.message);
                                                    return;
                                                }
                                                log ("[k2 batt] proxy callback");
                                                this._proxy.connect('g-properties-changed',
												this._sync.bind(this));
                                                this._sync();
                                            });
                                            
		this._item = new PopupMenu.PopupSubMenuMenuItem("", true);
        this._item.menu.addSettingsAction(_("Power Settings"), 'gnome-power-panel.desktop');
        this.menu.addMenuItem(this._item);

        Main.sessionMode.connect('updated', this._sessionUpdated.bind(this));
        this._sessionUpdated();
	}

	///
    _sessionUpdated() {
        let sensitive = !Main.sessionMode.isLocked && !Main.sessionMode.isGreeter;
        this.menu.setSensitive(sensitive);
    }

    _getStatus() {
        let seconds = 0;

        if (this._proxy.State == UPower.DeviceState.FULLY_CHARGED)
            return _("Fully Charged");
        else if (this._proxy.State == UPower.DeviceState.CHARGING)
            seconds = this._proxy.TimeToFull;
        else if (this._proxy.State == UPower.DeviceState.DISCHARGING)
            seconds = this._proxy.TimeToEmpty;
        else if (this._proxy.State == UPower.DeviceState.PENDING_CHARGE)
            return _("Not Charging");
        // state is PENDING_DISCHARGE
        else
            return _("Estimating…");

        let time = Math.round(seconds / 60);
        if (time == 0) {
            // 0 is reported when UPower does not have enough data
            // to estimate battery life
            return _("Estimating…");
        }

        let minutes = time % 60;
        let hours = Math.floor(time / 60);

        if (this._proxy.State == UPower.DeviceState.DISCHARGING) {
            // Translators: this is <hours>:<minutes> Remaining (<percentage>)
            return _("%d\u2236%02d Remaining (%d\u2009%%)").format(hours, minutes, this._proxy.Percentage);
        }

        if (this._proxy.State == UPower.DeviceState.CHARGING) {
            // Translators: this is <hours>:<minutes> Until Full (<percentage>)
            return _("%d\u2236%02d Until Full (%d\u2009%%)").format(hours, minutes, this._proxy.Percentage);
        }

        return null;
    }

    _sync() {
        // Do we have batteries or a UPS?
        let visible = this._proxy.IsPresent;
        if (visible) {
            this._item.show();
            this._percentageLabel.visible = this._desktopSettings.get_boolean(SHOW_BATTERY_PERCENTAGE);
        } else {
            // If there's no battery, then we use the power icon.
            this._item.hide();
            this._indicator.icon_name = 'system-shutdown-symbolic';
            this._percentageLabel.hide();
            return;
        }

        // The icons
        let chargingState = this._proxy.State == UPower.DeviceState.CHARGING
            ? '-charging' : '';
        let fillLevel = 10 * Math.floor(this._proxy.Percentage / 10);
        let icon = this._proxy.State == UPower.DeviceState.FULLY_CHARGED
            ? 'battery-level-100-charged-symbolic'
            : `battery-level-${fillLevel}${chargingState}-symbolic`;

        // Make sure we fall back to fallback-icon-name and not GThemedIcon's
        // default fallbacks
        let gicon = new Gio.ThemedIcon({
            name: icon,
            use_default_fallbacks: false
        });

        this._indicator.gicon = gicon;
        this._item.icon.gicon = gicon;

        let fallbackIcon = this._proxy.IconName;
        this._indicator.fallback_icon_name = fallbackIcon;
        this._item.icon.fallback_icon_name = fallbackIcon;

        // The icon label
        let label;
        if (this._proxy.State == UPower.DeviceState.FULLY_CHARGED)
            label = _("%d\u2009%%").format(100);
        else
            label = _("%d\u2009%%").format(this._proxy.Percentage);
        this._percentageLabel.clutter_text.set_markup('<span size="smaller">' + label + '</span>');

        // The status label
        this._item.label.text = this._getStatus();
    }
	///
   _getBatteryStatus(kb) {
		log("[k2 batt] read battery info");
		try {
			kb.refresh_sync(null);
		} catch (err) {
			log("[k2 batt] WTF: " + error);
		}
		let percentage = kb.percentage +"%";
		log("[k2 batt] " + percentage);
		return percentage;		
   }

   _sync() {
	   log("[k2 batt] _sync: begin" )
	   let text;
		try {
			log("[k2 batt] _sync: " + kb.model +" | "+ kb.native_path);
			super._sync();
			text = kb.model+ ": " + this._getBatteryStatus(kb);
		} catch (err) {
			log("[k2 batt] no batt found ");
			text = "n/a";
		}
	
		this._percentageLabel.clutter_text.set_markup('<span size="smaller">' + text + '</span>');
   }
}
