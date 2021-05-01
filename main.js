require('constants');
var _ = require('lodash');
var log = require('logging');
var tm = require('taskManagement');
var _p = require('periodic')
var periodicManager = _p.periodicManager;
var _r = require('request')
var requestManager = _r.requestManager;


var _serialize = tm._serialize;


function brain() {
  // Init memory
  if (!Memory.request) {
    Memory.request = { unhandled: {}, handled: {} };
  }
  if (!Memory.targetPool) {
    Memory.targetPool = {};
  }
  var ctx = {};
  log.dbug('___________TICK #' + Game.time + '___________');
  periodicManager();
  tm.taskManager(ctx);
  requestManager();
  // Throw new Error('test error')

}


module.exports.loop = function() {
    brain();
    // Try {
    //     brain()
    // } catch (e) {
    //     log.err(e);
    // }

  }