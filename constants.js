/* NOTE: if a constants string value can also be a function name then
         it must be defined globally somewhere.  It follows that a normal
         constant must have a string value that cannot be a function name.
*/


Object.assign(global, {
    REQUEST_CREEP: '**REQUEST CREEP**',
    REQUEST_TARGET: '**REQUEST TARGET**',
    TASK_ASSIGN_CREEP: 'taskAssignCreep',
    TASK_BASE_CLASS: 'taskBaseClass',
    TASK_GATHER: 'taskGather',
    TASK_GATHER_METHOD: 'taskGatherMethod',
    TASK_UPGRADE_CONTROLLER: 'taskUpgradeController',
    TASK_UPGRADE_CONTROLLER_METHOD: 'taskUpgradeControllerMethod',
  });