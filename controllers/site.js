/*!
 * nodeclub - site index controller.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 muyuan
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var User = require('../proxy').User;
var Topic = require('../proxy').Topic;
var config = require('../config');
var eventproxy = require('eventproxy');
var mcache = require('memory-cache');
var xmlbuilder = require('xmlbuilder');

// 主页的缓存工作。主页是需要主动缓存的
setInterval(function () {
  var limit = config.list_topic_count;
  // 只缓存第一页, page = 1。options 之所以每次都生成是因为 mongoose 查询时，
  // 会改动它
  var query = {};
  var options = { skip: (1 - 1) * limit, limit: limit, sort: '-top -last_reply_at'};
  var optionsStr = JSON.stringify(query) + JSON.stringify(options);
  Topic.getTopicsByQuery(query, options, function (err, topics) {
    mcache.put(optionsStr, topics);
    return topics;
  });
}, 1000 * 120); // 五秒更新一次
// END 主页的缓存工作

exports.index = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  page = page > 0 ? page : 1;
  var limit = config.list_topic_count;

  var proxy = eventproxy.create('topics', 'pages',
    function (topics, pages) {
      res.render('index', {
        topics: topics,
        current_page: page,
        list_topic_count: limit,
        pages: pages,
        site_links: config.site_links
      });
    });
  proxy.fail(next);

  // 取主题
  var query = {};
  var options = { skip: (page - 1) * limit, limit: limit, sort: '-top -last_reply_at'};
  var optionsStr = JSON.stringify(query) + JSON.stringify(options);
  if (mcache.get(optionsStr)) {
    proxy.emit('topics', mcache.get(optionsStr));
  } else {
    Topic.getTopicsByQuery(query, options, proxy.done('topics', function (topics) {
      return topics;
    }));
  }
  // END 取主题

  // 取分页数据
  if (mcache.get('pages')) {
    proxy.emit('pages', mcache.get('pages'));
  } else {
    Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
      var pages = Math.ceil(all_topics_count / limit);
      mcache.put(JSON.stringify(query) + 'pages', pages, 1000 * 60 * 1);
      proxy.emit('pages', pages);
    }));
  }
};

exports.sitemap = function (req, res, next) {
  var urlset = xmlbuilder.create('urlset',
    {version: '1.0', encoding: 'UTF-8'});
  urlset.att('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');

  var ep = new eventproxy();
  ep.fail(next);

  ep.all('sitemap', function (sitemap) {
    res.type('xml');
    res.send(sitemap);
  });

  var sitemapData = mcache.get('sitemap');
  if (sitemapData) {
    ep.emit('sitemap', sitemapData);
  } else {
    Topic.getLimit5w(function (err, topics) {
      if (err) {
        return next(err);
      }
      topics.forEach(function (topic) {
        urlset.ele('url').ele('loc', 'http://cnodejs.org/topic/' + topic._id);
      });

      var sitemapData = urlset.end();
      // 缓存一天
      mcache.put('sitemap', sitemapData, 1000 * 3600 * 24);
      ep.emit('sitemap', sitemapData);
    });
  }
};
