// ============= logger config ================
// symbol? move to constants?
const LOG_CRITICAL_SYMBOL = 'CRIT';
const LOG_DEBUG_SYMBOL = 'DBUG';
const LOG_ERROR_SYMBOL = '!ERR';
const LOG_INFO_SYMBOL = 'INFO';
const LOG_WARNING_SYMBOL = 'WARN';

const LOG_MIDDLE_SEPARATOR = ' -- ';
const LOG_PAD_LEFT = 20;  // keeps log readable
const LOG_ROOT_LEVEL = 4;
const LOG_SEPARATOR = ':';

const LOG_LEVEL_TO_SYMBOL = {
    0: LOG_ERROR_SYMBOL,
    1: LOG_CRITICAL_SYMBOL,
    2: LOG_WARNING_SYMBOL,
    3: LOG_INFO_SYMBOL,
    4: LOG_DEBUG_SYMBOL,
}
var LOG_SYMBOL_TO_LEVEL = {};  // reverse mapping
_.each(LOG_LEVEL_TO_SYMBOL, (symbol, key) => {
    LOG_SYMBOL_TO_LEVEL[symbol] = key;
});


// ============== logger init =============
function make_logger(logLevel) {
    /* returns a logging function
        replaces console.log, use as "log"
    */
    return function(message) {
        if (LOG_SYMBOL_TO_LEVEL[logLevel] <= LOG_ROOT_LEVEL) {
            let e;
            if (message instanceof Error) {
                e = message;  // TODO: fix lineNumber/fName when message is Error
            } else {
                e = new Error();
            }

            // TODO: smarter parsing of stack trace
            let frame = e.stack.split("\n")[2]; // change to 3 for grandparent func
            let lineNumber = frame.split(":")[5] || '??';
            let functionName = frame.split(" ")[5] || '?????';
            let paddingAmount = LOG_PAD_LEFT - (functionName.length + lineNumber.length);
            if (paddingAmount < 0) {
                paddingAmount = 0;
            }
            let pad = " ".repeat(paddingAmount);
            let prefix = logLevel + pad + functionName + LOG_SEPARATOR + lineNumber;
            console.log(prefix + LOG_MIDDLE_SEPARATOR + message);
        }
    }
}

module.exports.clear = function () {
    /* clear screeps console */
    console.log("<script>angular.element(document.getElementsByClassName('fa fa-trash ng-scope')[0].parentNode).scope().Console.clear()</script>")
}
module.exports.crit = make_logger(LOG_CRITICAL_SYMBOL);
module.exports.dbug = make_logger(LOG_DEBUG_SYMBOL);
module.exports.err  = make_logger(LOG_ERROR_SYMBOL);
module.exports.info = make_logger(LOG_INFO_SYMBOL);
module.exports.warn = make_logger(LOG_WARNING_SYMBOL);
