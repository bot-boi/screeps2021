"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require('lodash');
function shuffle(array) {
    var i = 0, j = 0, temp = null;
    for (i = array.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
exports.shuffle = shuffle;
function toIDs(array) {
    return _.pluck(array, 'id');
}
exports.toIDs = toIDs;
function toObjs(array) {
    return _.map(array, function (id) { return Game.getObjectById(id); });
}
exports.toObjs = toObjs;
function scan(room, center, radius) {
    var x = center.x;
    var y = center.y;
    var occupants = room.lookAtArea(y - radius, x - radius, y + radius, x + radius, true);
    return occupants;
}
exports.scan = scan;
function harvesterPopulation(room) {
    var sources = room.find(FIND_SOURCES);
    var result = { total: 0 };
    for (var sourceIndex in sources) {
        var source = sources[sourceIndex];
        var x = source.pos.x;
        var y = source.pos.y;
        var open_tiles = _.filter(room.lookForAtArea(LOOK_TERRAIN, y - 1, x - 1, y + 1, x + 1, true), function (obj) {
            return (obj.terrain !== "wall");
        });
        result.total += open_tiles.length;
        result[source.id] = open_tiles.length;
    }
    return result;
}
exports.harvesterPopulation = harvesterPopulation;
function generateKinCounter(room) {
    var counter = {};
    var creeps = _.filter(Game.creeps, function (creep) {
        return creep.room.name === room.name;
    });
    _.forEach(creeps, function (creep) {
        if (!counter[creep.memory.kin]) {
            counter[creep.memory.kin] = 0;
        }
        counter[creep.memory.kin] += 1;
    });
    return counter;
}
exports.generateKinCounter = generateKinCounter;