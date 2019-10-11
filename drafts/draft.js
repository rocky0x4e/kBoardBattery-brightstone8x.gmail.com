const { Gio, UPowerGlib: UPower } = imports.gi;
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
let prox = new PowerManagerProxy(Gio.DBus.system,BUS_NAME,'/org/freedesktop/UPower',()=>{log('ple')});

let con = prox.get_connection();
let iname = 'org.freedesktop.UPower';
let sender = ':1.37' ;
let sigNameAdd = 'DeviceAdded';
let sigNameRem = 'DeviceRemoved';
let oPath = '/org/freedesktop/UPower/devices';
let subIdAdd = con.signal_subscribe(sender,iname,sigNameAdd,oPath, null,0,() => {log('Dev added')});
let subIdRem = con.signal_subscribe(sender,iname,sigNameRem,oPath, null,0,() => {log('Dev removed')});



con.signal_unsubscribe(subIdAdd);
con.signal_unsubscribe(subIdRem);




bus-monitor "type='signal',sender='org.freedesktop.UPower',interface='org.freedesktop.UPower.Device'"
