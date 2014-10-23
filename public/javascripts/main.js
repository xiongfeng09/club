$(document).ready(function () {
  $('#search_form').submit(function (e) {
    //e.preventDefault();
    search();
  });

  function search() {
    var q = document.getElementById('q');
    if (q.value) {
      /*
       var hostname = window.location.hostname;
       var url = 'http://www.google.com/search?q=site:' + hostname + '%20';
       window.open(url + q.value, '_blank');
       */
      return true;
    } else {
      return false;
    }
  }

  var $backtotop = $('#backtotop');
  var top = $(window).height() - $backtotop.height() - 200;

  function moveBacktotop() {
    $backtotop.css({ top: top, right: 0});
  }

  $backtotop.click(function () {
    $('html,body').animate({ scrollTop: 0 });
    return false;
  });
  $(window).scroll(function () {
    var windowHeight = $(window).scrollTop();
    if (windowHeight > 200) {
      $backtotop.fadeIn();
    } else {
      $backtotop.fadeOut();
    }
  });

  moveBacktotop();
  $(window).resize(moveBacktotop);

  $('.topic_content a,.reply_content a').attr('target', '_blank');

  // pretty code
  prettyPrint();

  // data-loading-text="提交中"
  $('.submit_btn').click(function () {
    $(this).button('loading');
  });

  // 广告的统计信息
  $('.sponsor_outlink').click(function () {
    var $this = $(this);
    var label = $this.data('label');
    ga('send', 'event', 'banner', 'click', label, 1.00, {'nonInteraction': 1});
  });
});
