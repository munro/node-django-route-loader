/*jslint node: true, nomen: true, vars: true */

'use strict';

var P = require('bluebird'),
    proto = '__proto__';

function streamToPromisePipe(stream) {
    var defer_queue = [];

    stream.on('data', function (data) {
        defer_queue.shift().resolve(data);
    }).on('error', function (err) {
        defer_queue.shift().reject(err);
    });

    function wrapper(data) {
        var defer = P.defer();
        defer_queue.push(defer);
        stream.write(data);
        return defer.promise;
    }
    wrapper[proto] = stream;
    return wrapper;
}

function lazyStreamToPromisePipe(streamMaker, timeout) {
    timeout = timeout || 1000;
    function wrapper(data) {
        if (!wrapper._stream) {
            wrapper._stream = streamToPromisePipe(streamMaker());
        }
        if (wrapper._timeout) {
            clearTimeout(wrapper._timeout);
        }
        wrapper._timeout = setTimeout(function () {
            wrapper._stream.end();
            wrapper._stream = null;
            wrapper._timeout = null;
        }, timeout);
        return wrapper._stream(data);
    }
    wrapper.end = function () {
        if (!wrapper._stream) {
            return;
        }
        clearTimeout(wrapper._timeout);
        wrapper._stream.end();
        wrapper._stream = null;
        wrapper._timeout = null;
    };
    wrapper._stream = null;
    wrapper._timeout = null;
    return wrapper;
}

module.exports = streamToPromisePipe;
module.exports.lazy = lazyStreamToPromisePipe;
