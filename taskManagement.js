require('constants');
var _ = require('lodash');
var log = require('logging');
var _rq = require('request'), Request = _rq.Request;


function Task(taskType, methodID) {
  this.method = global[methodID];
  this.methodID = methodID;  // See constants
  this.taskType = taskType || TASK_BASE_CLASS;
  this.taskID = taskType + '|' + Game.time;
}


global.taskAssignCreep = function taskAssignCreep(creepID) {
    log.dbug(creepID + ' was assigned to task ' + this.taskID);
    this.assigned.push(creepID);
  }


global.taskRequestCreep = function taskRequestCreep(request) {
    if (!request) {
      request = new Request(this.taskID, REQUEST_CREEP, {
          creepArgs: {
              body: [WORK, CARRY, MOVE],
              name: this.taskID + '|WCM',
              memory: { assignedTask: this.taskID },
            },
          amount: this.maxCreep,
        });
    }
    log.dbug('making creep request for ' + this.taskID);
    if (!this.requestCooldown) {
      this.requestCooldown = 0;
    }
    if (this.requestCooldown > 0) {
      this.requestCooldown -= 1;
    } else if (!request.send()) {
      this.requestCooldown = 30;
    }
  }


global.taskFindNewCreeps = function taskFindNewCreeps() {
    if (this.assigned.length < this.maxCreep) {
      let unassigned_creeps = _.filter(Game.creeps, (creep) => { return (!creep.assigned) });
      _.each(unassigned_creeps, (creep) => {
          if (!creep.memory.assigned && creep.memory.assignedTask == this.taskID && !creep.spawning) {
            log.info('creep ' + creep.id + ' assigned to task ' + this.taskID);
            this.assigned.push(creep.id);
            creep.memory.assigned = true;
          }
        });
    }
  }


function TaskCreepTemplate() {
  this.maxCreep = 3;
  this.assigned = [];
  this.assignCreep = taskAssignCreep;
  this.requestCreep = taskRequestCreep;
  this.findNewCreeps = taskFindNewCreeps;
}


global.TaskUpgradeController = function TaskUpgradeController(controllerID, sourceID) {
    Task.call(this, TASK_UPGRADE_CONTROLLER, TASK_UPGRADE_CONTROLLER_METHOD);
    TaskCreepTemplate.call(this);
    this.controllerID = controllerID;
    this.sourceID = sourceID;
  }


global.taskUpgradeControllerMethod = function taskUpgradeControllerMethod(ctx) {
    // This should be separate ? this is sort of like pretick stuff
    if (this.assigned.length <= 0) {
      this.requestCreep();
    }
    this.findNewCreeps();
    let controller = Game.getObjectById(this.controllerID);
    _.each(this.assigned, (workerID, index) => {
        let worker = Game.getObjectById(workerID);
        if (!worker) {
          delete this.assigned[index]
          log.dbug('worker passed')
          return;
        }
        if (worker.store.energy <= 0) { // Decide upgrading or mining
          worker.memory.upgradeFlag = false;
        } else if (worker.store.getFreeCapacity() <= 0) {
          worker.memory.upgradeFlag = true;
        }
        if (!worker.memory.upgradeFlag) {
          var target = Game.getObjectById(this.sourceID);
          if (worker.harvest(target) == ERR_NOT_IN_RANGE) {
            worker.moveTo(target);
          }
        } else { // Mode: upgrade
          var target = Game.getObjectById(this.controllerID);
          if (worker.upgradeController(target) == ERR_NOT_IN_RANGE) {
            worker.moveTo(target);
          }
        }
      });
  }


// === TASK_GATHER ===
global.TaskGather = function TaskGather(sourceID, drainID) {
    Task.call(this, TASK_GATHER, TASK_GATHER_METHOD);
    TaskCreepTemplate.call(this);
    this.drainID = drainID;
    this.sourceID = sourceID;
    log.info('created new ' + this.taskType + ' identified as ' + this.taskID);
  }


// === TASK_GATHER_METHOD ===
global.taskGatherMethod = function taskGatherMethod(ctx) {
    /* Run function for TaskGather
        uses assigned to gather energy from a source
        and store it in a spawn
    */
    if (this.assigned.length <= 0) {
      this.requestCreep();
    }
    this.findNewCreeps();
    _.each(this.assigned, (workerID) => {
        let worker = Game.getObjectById(workerID);
        // Mode: harvest
        if (worker.store.getFreeCapacity() > 0) {
          let target = Game.getObjectById(this.sourceID);
          if (!target) {
            worker.say('need target');
            return;
          }
          if (worker.harvest(target) == ERR_NOT_IN_RANGE) {
            worker.moveTo(target);
          }
        } else { // Mode: haul
          let target = Game.getObjectById(this.drainID);
          if (worker.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            worker.moveTo(target);
          }
        }
      });
  }


const SERIAL_FUNC_TAG = 'FUNC';


function _serialize(ob) {
  /* Encode an object
      fake encoding of ob methods
      uses global constants to reload
      only checks top level properties for functions (shallow)
  */
  let data = Object.assign({}, ob);  // Clone
  for (let prop in data) {
    if (typeof (data[prop]) === 'function') {
      if (!global[data[prop].name]) {
        log.dbug(data[prop].name + ' must be in *global* so it can be deserialized');
      }
      // Log.dbug('serializing ' + prop + ' as ' + SERIAL_FUNC_TAG + data[prop].name);
      data[SERIAL_FUNC_TAG + prop] = data[prop].name;  // Store function key in object
    }
  }
  return data;
}


function _deserialize(ob) {
  /* Decode an object
      uses global constants to reload ob methods
  */
  let data = Object.assign({}, ob);
  for (let prop in data) {  // Property
    if (prop.startsWith(SERIAL_FUNC_TAG)) {  // Replace function names with functions
      let func_key = data[prop];
      let actual_prop = prop.split(SERIAL_FUNC_TAG).pop();  // The original property name
      if (!global[func_key]) {
          throw new Error('_deserialize got invalid key ' + func_key + ' you need to define it in global');
      }
      data[actual_prop] = global[func_key];
      delete data[prop];
      // Log.dbug('loaded function ' + func_key + ' from mem/global');
    }
  }
  if (!data) {
    log.dbug('failed to deserialize')
  }
  // Log.dbug('task data after deserialize ' + Object.keys(data));
  data.method()
  return data;
}


function taskManager(ctx) {
  /* Manage tasks
      temporary, tasks will mostly be set and forget using flags or something
  */
  if (!Memory.tasks) {
    _.each(Game.rooms, (room) => {
        let controller = room.controller;
        let sources = room.find(FIND_SOURCES);
        let spawn = Game.spawns['Spawn1'];
        let myGatherTask = new TaskGather(sources[0].id, spawn.id);
        let myUpgradeTask = new TaskUpgradeController(controller.id, sources[0].id);
        Memory.tasks = [_serialize(myGatherTask), _serialize(myUpgradeTask)];
    });
  }
  let taskMem = Memory.tasks;
  let tasks = _.map(taskMem, (task) => { return _deserialize(task) });
  let taskIDs = _.map(tasks, (task) => { return task.taskID });
  log.dbug('tasks this tick: ' + taskIDs);
  _.each(tasks, (task) => {
      try {
          task.method(ctx);
      } catch (err) {
          log.err(err);
      }
  });
  tasks = _.map(tasks, (task) => { return _serialize(task) });
  Memory.tasks = tasks;
  return this;
}


module.exports = {
    _serialize, _deserialize, TaskGather, TaskUpgradeController, taskManager,
  };
