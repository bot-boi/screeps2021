// ============= logger config ================
const LOG_CRITICAL_SYMBOL = 'CRIT';
const LOG_DEBUG_SYMBOL = 'DBUG';
const LOG_ERROR_SYMBOL = '!ERR';
const LOG_INFO_SYMBOL = 'INFO';
const LOG_TRACE_SYMBOL = 'TRCE';
const LOG_WARNING_SYMBOL = 'WARN';

const LOG_MIDDLE_SEPARATOR = ' -- ';  // Prefix LOG_MIDDLE_SEPARATOR message
const LOG_PAD_LEFT = 20;  // Keeps log readable
const LOG_DEFAULT_LEVEL = 5;
const LOG_SEPARATOR = ':';

const LOG_LEVEL_TO_SYMBOL = {
    0: LOG_ERROR_SYMBOL,
    1: LOG_CRITICAL_SYMBOL,
    2: LOG_WARNING_SYMBOL,
    3: LOG_INFO_SYMBOL,
    4: LOG_DEBUG_SYMBOL,
    5: LOG_TRACE_SYMBOL,
  }
var LOG_SYMBOL_TO_LEVEL = {};  // Reverse mapping
_.each(LOG_LEVEL_TO_SYMBOL, (symbol, key) => {
    LOG_SYMBOL_TO_LEVEL[symbol] = key;
  });


function makeLogger(logLevel) {
  /* Returns a logging function
      replaces console.log, use as "log"
  */
  return function(message) {
      if (LOG_SYMBOL_TO_LEVEL[logLevel] <= Memory.logging.logLevel) {
        let e;
        if (message instanceof Error) {
          e = message;  // TODO: fix lineNumber/fName when message is Error
        } else {
          e = new Error();
        }
        let frame = e.stack.split('\n')[2]; // Change to 3 for grandparent func
        frame = frame.split('(');
        let info = frame[frame.length - 1].split(':');
        let column = info[info.length - 1];
        let lineNumber = info[info.length - 2];
        let moduleName = info[info.length - 3];
        let paddingAmount = LOG_PAD_LEFT - (moduleName.length + lineNumber.length);
        if (paddingAmount < 0) {
          paddingAmount = 0;
        }
        let pad = ' '.repeat(paddingAmount);
        let prefix = logLevel + pad + moduleName + LOG_SEPARATOR + lineNumber;
        console.log(prefix + LOG_MIDDLE_SEPARATOR + message);
      }
    }
}


if (!Memory.logging) {
  Memory.logging = { logLevel: LOG_DEFAULT_LEVEL };
}

module.exports.setLevel = function(level) {
    Memory.logging.logLevel = level;
    console.log('changed log level to ' + Memory.logging.logLevel);
  }

module.exports.clear = function() {
    /* Clear screeps console */
    console.log('<script>angular.element(document.getElementsByClassName(\'fa fa-trash ng-scope\')[0].parentNode).scope().Console.clear()</script>')
  }
module.exports.crit = makeLogger(LOG_CRITICAL_SYMBOL);
module.exports.dbug = makeLogger(LOG_DEBUG_SYMBOL);
module.exports.err  = makeLogger(LOG_ERROR_SYMBOL);
module.exports.info = makeLogger(LOG_INFO_SYMBOL);
module.exports.trace = makeLogger(LOG_TRACE_SYMBOL);
module.exports.warn = makeLogger(LOG_WARNING_SYMBOL);