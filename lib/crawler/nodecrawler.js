/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2014, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';

var Crawler = require('simplecrawler'),
    winston = require('winston'),
    url = require('url');

module.exports.crawl = function(startUrl, config, callback) {
  var log = winston.loggers.get('sitespeed.io');

  var u = url.parse(startUrl);
  var okUrls = [], errorUrls = {};

  var c = new Crawler(u.hostname, u.path, u.port);
  c.userAgent = config.userAgent;
  c.initialProtocol = config.urlObject.protocol;

  // Sitespeed and simplecrawler have different semantics for specifying depth.
  c.maxDepth = config.deep + 1;

  if (config.proxy) {
    c.useProxy = true;
    c.proxyHostname = config.urlProxyObject.hostname;
    c.proxyPort = config.urlProxyObject.port;
  }

  if (config.basicAuth) {
    c.needsAuth = true;
    c.authUser = config.basicAuth.split(':')[0];
    c.authPass = config.basicAuth.split(':')[1];
  }

  //if (config.containInPath) {
  //}

  //if (config.skip) {
  //}

  c.downloadUnsupported = false;
  c.allowInitialDomainChange = true;

  c.timeout = 3000;

  c.allowedProtocols = [/^http(s)?$/i];

  c.addFetchCondition(function(parsedURL) {
    return !parsedURL.uriPath.match(/\.(gif|jpg|jpeg|tiff|png|webp|ico|mp3|pdf|xml|css|js|zip|rar)$/i);
  });

  c.on('fetchcomplete', function(queueItem) {
    if (queueItem.stateData.contentType.indexOf('text/html') > -1) {
      log.verbose('Fetched: ' + queueItem.url);
      okUrls.push(queueItem.url);
    }
  });

  c.on('fetcherror', function(queueItem) {
    var message = 'Failed to download (' + queueItem.stateData.code + '): ' + queueItem.url + ' when crawling';
    log.error(message);
    errorUrls[queueItem.url] = queueItem.stateData.code;
  });

  c.on('complete', function() {
    callback(okUrls, errorUrls);
    c.stop();
  });

  c.start();
};
