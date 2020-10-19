const Lang = imports.lang;
const { St, Gio, UPowerGlib: UPower } = imports.gi;
const xml ='<node>\
   <interface name="org.freedesktop.UPower.Device">\
      <property name="Type" type="u" access="read" />\
      <property name="State" type="u" access="read" />\
      <property name="Percentage" type="d" access="read" />\
      <property name="TimeToEmpty" type="x" access="read" />\
      <property name="TimeToFull" type="x" access="read" />\
      <property name="IsPresent" type="b" access="read" />\
      <property name="IconName" type="s" access="read" />\
   </interface>\
</node>';

const PowerManagerProxy = Gio.DBusProxy.makeProxyWrapper(xml);
const BUS_NAME = 'org.freedesktop.UPower';
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Clutter    = imports.gi.Clutter;

var dbusCon;

var kBattIndicator = new Lang.Class({

	Name : "BtKeybBattIndicator",
	Extends: PanelMenu.Button,

	_init: function () {
		Log("Init kBattIndicator");

		this.parent(0.0, "BtKeybBattIndicator");

		var hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box bt-keyb-batt-hbox' });
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
		this.actor.hide();

		Log('dev listener');
		var uPower_proxy = new PowerManagerProxy(
			Gio.DBus.system,
			BUS_NAME,
			'/org/freedesktop/UPower',
			(proxy,error)=>{
				Log('+ _devConnectionListener +')
					if (error) {
						Log("PANIC");
						Log(error.message);
					}
			});

		dbusCon = uPower_proxy.get_connection();

		var iname = 'org.freedesktop.UPower';
		var sender = 'org.freedesktop.UPower' ;

		this.keyboard = this.findKeyboard();
		this._newProxy();
		this.subIdAdd = dbusCon.signal_subscribe(sender,iname,'DeviceAdded',null, null,0,() => {
				Log('Dev added')
				this.keyboard = this.findKeyboard();
				this._newProxy();
			});
		this.subIdRem = dbusCon.signal_subscribe(sender,iname,'DeviceRemoved',null, null,0,() => {
				var kb = this.findKeyboard();
				Log('Hold on! Something has been removed')
				if (kb === undefined) {
					Log("Too bad, so sad. It's your keyboard");
					this._proxy = null;
					this.keyboard = null;
					this.entryItem.label.set_text("Too bad, so sad. Keyboard's removed");
					this.buttonText.set_text('%');
					this.actor.hide();

				} else if (kb.native_path != this.keyboard.native_path) {
					Log("Bad news, Keyboard's removed! Good news, found another one");
					this.keyboard = kb;
					this._proxy = null;
					this._newProxy();
				} else {
					Log("Wew!!! not your keyboard");
				}
			});
	},

	findKeyboard : function () {
		Log("findKeyboard");
		var upowerClient = UPower.Client.new_full(null);
		var devices = upowerClient.get_devices();
		var i;
		for (i=0; i < devices.length; i++){
			if (devices[i].kind == UPower.DeviceKind.KEYBOARD){
				Log("Found: " + devices[i].model + " | " + devices[i].native_path);
				return devices[i];
			}
		}
	},

	_sync : function () {
		Log("_sync: begin" )
		var text;
		try {
			var percent = this.getBatteryStatus();
			Log("_sync: " + this.keyboard.model + " | " + this.keyboard.native_path);
			text = this.keyboard.model+ ": " + percent;
			this.entryItem.label.set_text(text);
			this.buttonText.set_text(percent);
			this.actor.show();
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
		var percentage = this.keyboard.percentage +"%";
		Log(percentage);
		return percentage;
	},

	_newProxy : function(){
		Log("Create new DBusProxy");
		if (this.keyboard === undefined){
			Log("Too bad, so sad, no bluetooth keyboard's detected, no proxy");
		} else {
			if (this._proxy === undefined || this._proxy === null) {
				this._proxy = new	PowerManagerProxy(Gio.DBus.system,
									BUS_NAME,
									this.keyboard.get_object_path(),
									(proxy, error) => {
										Log ("Proxy callback function");
										if (error) {
											Log("PANIC");
											Log(error.message);
											return;
										}
										this._proxy.connect('g-properties-changed',
											this._sync.bind(this));
										this._sync();
									}
								);
			} else {
				Log("Proxy existed");
			}
		}
	},

	reset : function (){
		this.entryItem.destroy();
		this.buttonText.destroy();
	}

});

var Log = function(msg) {
	log ("[kBatt] " + msg);
}
