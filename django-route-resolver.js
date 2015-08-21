/*jslint node: true, nomen: true, vars: true */

'use strict';

var _ = require('lodash'),
    path = require('path'),
    pythonPipe = require('./python-pipe');

var ROUTE_RESOLVER_PATH = path.join(__dirname, 'route_resolver.py');

module.exports = _.partial(pythonPipe, ROUTE_RESOLVER_PATH);
module.exports.lazy = _.partial(pythonPipe.lazy, ROUTE_RESOLVER_PATH);
module.exports.stream = _.partial(pythonPipe.stream, ROUTE_RESOLVER_PATH);
