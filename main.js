require('constants');
var _ = require('lodash');
var log = require('logging');
var tm = require('taskManagement');
var _p = require('periodic'), periodicManager = _p.periodicManager;
var _r = require('request'), requestManager = _r.requestManager;


var _serialize = tm._serialize;


function brain() {
    // init memory
    if (!Memory.request) {
        Memory.request = { unhandled: {}, handled: {} };
    }
    if (!Memory.targetPool) {
        Memory.targetPool = {};
    }
    var ctx = {};
    log.info('___________TICK #' + Game.time + '___________');
    periodicManager();
    tm.taskManager(ctx);
    requestManager();
    
}





module.exports.loop = function () {
    try {
        brain()
    } catch (e) {
        log.err(e);
    }
    
}