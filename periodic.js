var _ = require('lodash');
var log = require('logging');


function Periodic(id, interval, func, fargs) {
    /* runs a function every so often
    */
    this.fargs = fargs;
    this.func = func;
    this.id = id;  // also key/property
    this.interval = interval;
    this.isTick = function() {
        return ((Game.time % this.interval) == 1);
    }
    this.doTick = function() {
        return this.func(this.fargs);
    }   
    this.tick = function() {
        if (this.isTick()) {
            log.dbug('running periodic ' + this.id);
            return this.doTick();
        }
    }
}


function EZPeriodic(id, find_const, interval) {
    /* create a Periodic using screeps FIND_* constants that
       updates a property of Memory.targetPool
    */
    return new Periodic(id, interval, () => {
        Memory.targetPool[id] = {};  // find in ALL rooms
        let targets = _.flatten(_.map(Game.rooms, (room) => {
            return room.find(find_const)
        }));
        _.each(targets, (target) => {
            Memory.targetPool[id][target.id] = target.room.name;
        });
    });
}


const always = 5;
const frequent = 30;
const occasional = 150;
var periodics = [
    // periodically save all spawn IDs and their room name
    new EZPeriodic('spawns', FIND_MY_SPAWNS, frequent),
    new EZPeriodic('sources', FIND_SOURCES, frequent),  // change to occasional...
]


function periodicManager() {
    if (!Memory.targetPool) {
        Memory.targetPool = {};
    }
    _.each(periodics, (periodic) => {
        periodic.tick();
    });
}


module.exports = {
    periodicManager,
}