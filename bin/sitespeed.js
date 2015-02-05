#!/usr/bin/env node

/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
/*eslint no-process-exit:0*/

var Sitespeed = require('../lib/sitespeed'),
    config = require('../lib/cli'),
    winston = require('winston');

var sitespeed = new Sitespeed();

sitespeed.run(config, function(err) {
  if (err) {
    winston.loggers.get('sitespeed.io').error(err);
    process.exit(1);
  }
});
