require('constants');
var log = require('logging');


function Request(id, requestType, requestArgs) {
    this.id = id;
    this.type = requestType;
    this.requestArgs = requestArgs;
    this.send = function() {  // make the request
        let rmem = Memory.request;
        if (rmem.unhandled[this.id]) {
            log.dbug('request ' + this.id + ' already exists! plz wait ur turn');
            return false;
        }
        rmem.unhandled[this.id] = this;
        return true;
    }
}


function handleCreepRequest(request) {
    // handle request for spawning a creep
    let requestArgs = request.requestArgs;
    let spawns = Object.keys(Memory.targetPool.spawns);
    if (requestArgs.roomName) { // the room to spawn in
        spawns = _.filter(spawns, (spawn) => {
            return (spawn.room.name === requestArgs.roomName)
        });
        if (!spawns) {
            log.err('cant handle creep request ' + request.id + ' no spawns in room ' + requestArgs.roomName);
        }
    }
    if (spawns.length <= 0) {
        log.dbug('cant handle creep request ' + request.id + ', no spawns');
        return;
    }
    // just pick the first spawn for now
    let spawn = Game.getObjectById(spawns[0]);
    let creepArgs = requestArgs.creepArgs;
    let res = spawn.spawnCreep(creepArgs.body, creepArgs.name + Game.time, { memory: creepArgs.memory });
    if (res == ERR_BUSY) {
        log.dbug('cant handle creep request ' + request.id + ', spawn is busy');
    } else if (res == ERR_NOT_ENOUGH_ENERGY) {
        log.dbug('cant handle creep request ' + request.id + ', not enough energy');
    } else if (res == ERR_INVALID_ARGS) {
        log.dbug('cant handle creep request ' + request.id + ', bad spawnCreep args');
    } else {
        log.dbug('cant handle creep request ' + request.id + ', ' + res);
    }
    if (res == OK) {
        request.requestArgs.amount -= 1;
    }
    if (requestArgs.amount == 0) {
        return true;
    }
    return false;
}


function requestManager() {
    if (!Memory.request) {
        Memory.request = {
            unhandled: {},
            handled: {},
        };
    }
    _.each(Memory.request.unhandled, (request) => {
        log.dbug('maybe handling request ' + request.id);
        if (request.type === REQUEST_CREEP) {
            if (handleCreepRequest(request)) {
                log.dbug('successfully handled ' + request.id);
                Memory.request.handled[request.id] = request;
                delete Memory.request.unhandled[request.id];
            }
            
        
        // } else if (request.type === REQUEST_TARGET) {
            // it's really too early to know how im going to do this
            // let targetType = request.targetType;
            // let newTarget = TargetPool.getTarget(targetType);
        } else {
            log.warn('unhandled request ' + request.id + ' of type ' + request.type);
        }
    });
    // what to do with handled requests?
}


module.exports = {
    requestManager, Request,
};
