/*jslint node: true, nomen: true, vars: true */

'use strict';

var _ = require('lodash'),
    path = require('path'),
    spawn = require('child_process').spawn,
    duplex = require('duplexer'),
    JSONWriter = require('newline-json').Stringifier,
    JSONReader = require('newline-json').Parser,
    streamPromisePipe = require('./stream-promise-pipe');

function pythonPipeStream(script, opts) {
    if (_.isObject(script)) {
        opts = script;
        script = null;
    }
    opts = _.defaults({
        python: 'python',
        script: script,
        args: [],
        options: undefined
    }, opts);
    opts.args = (opts.script ? [opts.script] : []).concat(opts.args);
    var route_writer = new JSONWriter(),
        route_process = spawn(opts.python, opts.args, opts.options),
        open = true,
        processing = 0;

    process.on('exit', function () {
        route_process.kill('SIGKILL');
    });

    var stream = duplex(
        route_writer,
        route_writer
            .pipe(duplex(route_process.stdin, route_process.stdout))
            .pipe(new JSONReader())
    ).on('data', function () {
        processing -= 1;
        if (!open && !processing) {
            route_process.kill('SIGKILL');
        }
    });

    route_writer.on('data', function () {
        processing += 1;
    }).on('end', function () {
        route_process.stdin.end();
        open = false;
        if (!processing) {
            route_process.kill('SIGKILL');
        }
    });

    return stream;
}

function pythonPromisePipe(script, opts) {
    return streamPromisePipe(pythonPipeStream(script, opts));
}

function pythonPromisePipeLazy(script, opts) {
    return streamPromisePipe.lazy(function () {
        return pythonPipeStream(script, opts);
    });
}

module.exports = pythonPromisePipe;
module.exports.lazy = pythonPromisePipeLazy;
module.exports.stream = pythonPipeStream;
