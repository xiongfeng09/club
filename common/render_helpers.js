/*!
 * nodeclub - common/render_helpers.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var marked = require('marked');
var _ = require('lodash');
var config = require('../config');
var validator = require('validator');

marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});

exports.markdown = function (text) {
  return '<div class="markdown-text hljs">' + marked(text || '') + '</div>';
};

exports.escapeSignature = function (signature) {
  return signature.split('\n').map(function (p) {
    return _.escape(p);
  }).join('<br>');
};

exports.staticFile = function (filePath) {
  return config.site_static_host + filePath;
};

