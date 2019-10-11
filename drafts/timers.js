const Mainloop = imports.mainloop;

var setTimeout = function(func, millis /* , ... args */) {

    let args = [];
    if (arguments.length > 2) {
        args = args.slice.call(arguments, 2);
    }

    let id = Mainloop.timeout_add(millis, () => {
        func.apply(null, args);
        return false; // Stop repeating
    }, null);

    return id;
};

var clearTimeout = function(id) {

    Mainloop.source_remove(id);
};

var setInterval = function(func, millis /* , ... args */) {

    let args = [];
    if (arguments.length > 2) {
        args = args.slice.call(arguments, 2);
    }

    let id = Mainloop.timeout_add(millis, () => {
        func.apply(null, args);
        return true; // Repeat
    }, null);

    return id;
};

var clearInterval = function(id) {

    Mainloop.source_remove(id);
};
