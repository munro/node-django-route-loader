/*jslint node: true, nomen: true, vars: true */

'use strict';

var test = require('tap').test;

var djangoRouteInterpolate = require('./django-route-interpolate');

var TEST_ROUTE = [{"pattern": "a/company/(?P<company_id>[\\d-]+)/$", "defaults": {}, "possibility": [["a/company/%(company_id)s/", ["company_id"]]]}];

test('fixed api', function (t) {
    t.plan(2);
    t.equals(
        djangoRouteInterpolate.fixed(TEST_ROUTE, [], {company_id: 123}),
        'a/company/123/'
    );
    t.equals(
        djangoRouteInterpolate.fixed(TEST_ROUTE, [123]),
        'a/company/123/'
    );
});

test('pretty api', function (t) {
    t.plan(2);
    var my_route = djangoRouteInterpolate(TEST_ROUTE);
    t.equals(my_route({company_id: 123}), 'a/company/123/');
    t.equals(my_route(123), 'a/company/123/');
});
