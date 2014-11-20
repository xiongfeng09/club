exports.run_site_tools = function (req, res, next) {
  res.send('<h3>The White Castle</h3>');
};

exports.hotkey = function (req, res, next) {
  res.render('tools/hotkey')
};
