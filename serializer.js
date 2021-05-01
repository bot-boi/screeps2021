const SERIAL_FUNC_TAG = 'FUNC';


var SERIALIAZIBLE = {};


function Serialiazible(func) {
  /* Make a function work with serialize/deserialize
      basically just adds *func* to *SERIALIAZIBLE*
  */
  if (typeof (func) !== 'function') {
    throw new Error(`cannot serialize ${func}, wrong type: ${type (func)}`);
  } else if (!func.name) {
    throw new Error(`functions must have a name property to be serialiazable`);
  } else if (SERIALIAZIBLE[func.name]) {
    throw new Error(`function ${func.name} is already SERIALIAZIBLE`);
  }
  SERIALIAZIBLE[func.name] = func;
}


function serialize(object) {
  /* Encode an Object
      if object has top level functions then they
      must be *Serialiazible"
  */
  let clone = Object.assign({}, ob);
  clone._SERIALfunctions = {};
  for (let prop in clone) {
    if (typeof (clone[prop]) === 'function') {
      // Method name -> function name
      clone._SERIALfunctions[prop] = clone[prop].name;
    }
  }
  return clone;
}


function deserialize(object) {
  /* Decode an object
      use SERIALIAZIBLE variable to reload object methods
  */
  let clone = Object.assign({}, object);
  for (let funcName in clone._SERIALfunctions) {
    clone[funcName] = SERIALIAZIBLE[funcName];
  }
  delete clone._SERIALfunctions;
  return clone;
}


function testSerialize() {
  // TODO
}


function testDeserialize() {
  // TODO -- these will need their own file that doesnt get uploaded to screeps
}

module.exports = {

};
