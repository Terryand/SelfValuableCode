function playvideo(mda, domID, mp4, imageAdvsSetting) {
  var video_url = '';
  if (mp4) {
    video_url = '//gcik47gyt746q6nqdze.exp.bcevod.com/' + mda + '/src/src-' + mda + '.mp4';
  } else {
    video_url = '//gcik47gyt746q6nqdze.exp.bcevod.com/' + mda + '/' + mda + '.m3u8';
  }

  var imageAdvs = imageAdvsSetting ? imageAdvsSetting : {};

  var player = cyberplayer(domID).setup({
    width: '100%',
    height: '100%',
    stretching: "uniform",
    file: video_url,
    autostart: true,
    repeat: false,
    volume: 100,
    controls: true,
    ak: '77f99df9002b4bb8be40288a9ca80e6b',
    imageAdvs: imageAdvs,
  });

  if (!window.players || typeof window.players !== 'object') {
    window.players = {};
  }
  window.players[domID] = player;
}

$(document).ready(function () {
  document.addEventListener('touchstart', function (event){});
  var apiDomain = $('meta[name=systemenv]').attr('content');

  // nav
  if (window.history.length > 1) {
    $('.go-back').removeClass('hide');
  }
  $('.go-back').click(function () {
    window.history.go(-1);
  });

  // 返回顶部
  $('.back-top').click(function () {
    window.scrollToSmoothly({x: 0, y: 0});
  });

  var infoNavScrollPosition = getPageScrollByID('info-nav-wrapper');

  // 页面滚动事件监听
  window.onscroll = function () {
    var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;

    // 向下滚动后，显示返回顶部按钮
    if (scrollTop > 0) {
      $('.back-top-container').fadeIn();
    } else {
      $('.back-top-container').fadeOut();
    }

    // 超过导航位置时，导航条悬浮
    if (scrollTop > infoNavScrollPosition.y) {
      $('.info-nav').addClass('fixed');
    } else {
      $('.info-nav').removeClass('fixed');
    }
  };

  // 切换课程信息导航
  $('.info-nav > li').click(function () {
    if ($(this).hasClass('active')) return;

    var index = $(this).index();
    $(this).addClass('active').siblings('li').removeClass('active');
    $('.info-show > li').eq(index).addClass('active').siblings('li').removeClass('active');

    // 移除大纲第一层级的 icon 动画效果
    $('.collapse-header > span').removeClass('reversed-rx rx');
  });


  var $orderSelector = $('.order-selector');
  var $orderSelectorWrapper = $('.order-selector-wrapper');
  // 统一展开班次选择器的方法
  function unfoldOrderSelector() {
    $orderSelector.removeClass('slideOutDown').addClass('slideInUp');
    $orderSelectorWrapper.show();
  }

  // 统一收起班次选择器的方法
  function packupOrderSelector() {
    $orderSelector.removeClass('slideInUp').addClass('slideOutDown');
    setTimeout(function () {
      $orderSelectorWrapper.hide();
    }, 300);
  }

  // 展开班次选择器
  $('.summary .inline-btn').click(function () {
    // 交互要求，不同地方唤起展示不同文案
    $('.order-selector .sure-buy').html('立即购买');

    unfoldOrderSelector();
  });
  $('.btn-group .buy').click(function () {
    var buyHref = $(this).attr('href');

    if (!$(this).hasClass('disabled') && (!buyHref || buyHref === 'javascript:;')) {
      // 交互要求，不同地方唤起展示不同文案
      $('.order-selector .sure-buy').html('确 定');

      unfoldOrderSelector();
    }
  });

  // 收起班次选择器
  $('.order-selector-wrapper .close-btn').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    packupOrderSelector();
  });
  $orderSelectorWrapper.click(function () {
    packupOrderSelector();
  });

  // 获取班次信息
  function getInfo($this, callback) {
    var pcid = $this.data('id'),
      pcidType = $this.data('type');

    var idSet = {};
    idSet[pcidType] = pcid.toString();
    $.ajax({
      url: apiDomain + '/price_post.php',
      type: 'post',
      dataType: 'json',
      data: {
        idSet: idSet,
      },
      success: function (data) {
        if (!data || !data[pcidType] || !data[pcidType][pcid]) {
          alert('对不起，指定班次不存在，请咨询网校客服');
          return ;
        }

        // 更新信息
        updateInfo(data[pcidType][pcid], pcidType, pcid);
        // 切换活跃状态
        callback(pcidType, pcid);
      },
      error: function () {
        alert('对不起，网络连接失败，请稍后重试或咨询网校客服');
      }
    });
  }

  // 初始化第一个班次信息
  getInfo($('#primary_buy'), function (pcidType, pcid) {
    var $primaryBuy = $('#primary_buy');
    if ($('.order-selector-wrapper .options-wrapper > a').length <= 1 && !$primaryBuy.hasClass('disabled')) {
      $primaryBuy.attr('href', apiDomain + '/space.php?do=course&viewcourse=buycourseinfo_jump&' + pcidType + '=' + pcid);
    }
  });

  // 切换班次
  $('.options-wrapper > a').click(function (e) {
    e.preventDefault();
    e.stopPropagation();

    var $this = $(this);
    if ($this.hasClass('active')) return;
    getInfo($this, function () {
      $this.addClass('active').siblings().removeClass('active')
    });
  });

  // 统一封装 更新班次信息 的方法
  var $price1 = $('#price1'),
    $price2 = $('#price2'),
    $oriPrice = $('#ori_price'),
    $discount = $('#discount'),
    $length = $('#length'),
    $protocol = $('#protocol'),
    $payBtn = $('#pay_btn');
  function updateInfo(data, pcidType, pcid) {
    // 现价
    var price = data.price.slice(0, -1);
    $price1.html(price);
    $price2.html(price);

    // 原价 && 折扣
    var oriPrice = data.oriprice ? data.oriprice.slice(0, -1) : '';
    $oriPrice.html('￥' + oriPrice);
    if (oriPrice) {
      var discount = (parseFloat(price) / parseFloat(oriPrice)).toFixed(1);
      $discount.html(discount + '折');

      $oriPrice.parent().removeClass('hide');
      $discount.removeClass('hide');
    } else {
      $oriPrice.parent().addClass('hide');
      $discount.addClass('hide');
      $discount.html('-折');
    }

    // 课时
    $length.html(data.length);

    // 协议
    $protocol.html(br2Semicolon(data.premium));
    if (!data.premium) {
      $protocol.hide();
    } else {
      $protocol.show();
    }

    // 购买链接
    $payBtn.attr('href', apiDomain + '/space.php?do=course&viewcourse=buycourseinfo_jump&' + pcidType + '=' + pcid);
  }

  function br2Semicolon(str) {
    var reg = /(\<br\>)|(\<br\s\>)|(\<br\/\>)|(\<br\s\/\>)/g;
    return str.replace(reg, ';');
  }

  // 课程大纲展开 && 收起
  $('.collapse-header').click(function () {
    var $parent = $(this).parent();
    var $arrow = $(this).children('span');
    // 收起
    if ($parent.hasClass('active')) {
      $parent.children('.collapse-content').slideUp();
      $arrow.removeClass('rx').addClass('reversed-rx');
      $parent.removeClass('active');
    } else {
      $arrow.removeClass('reversed-rx').addClass('rx');
      $parent.children('.collapse-content').slideDown();
      $parent.addClass('active');
    }
  });

  // 视频播放
  var mdaId = $('meta[name=mda]').attr('content');
  var adUrl = $('meta[name=adurl]').attr('content');
  var adSrc = $('meta[name=adsrc]').attr('content');
  $('.banner .play-btn').click(function () {
    $('#player-wrapper').show();

    var adSetting = (adUrl && adSrc) ? {
      pause: {
        image: adSrc,
        url: adUrl,
      }
    } : null;
    playvideo(mdaId, 'player-wrapper', false, adSetting);
  });

  // 抽屉导航 抽出 && 收起
  var $drawer = $('.drawer');
  var $drawerContent = $('.drawer > .content');
  var $navButton = $('header .nav-button');
  var $navButtonArrow = $('header .nav-button > span');
  function unfoldDrawer() {
    $navButton.addClass('active');
    $drawer.show();
    $drawerContent.removeClass('slideOutUp').addClass('slideInDown');
    $navButtonArrow.removeClass('reversed-rx').addClass('rx');
  }

  function packupDrawer() {
    $navButton.removeClass('active');
    $drawerContent.removeClass('slideInDown').addClass('slideOutUp');
    $navButtonArrow.removeClass('rx').addClass('reversed-rx');
    setTimeout(function () {
      $drawer.hide();
    }, 400);
  }

  $('header .nav-button').click(function () {
    if ($(this).hasClass('active')) {
      packupDrawer();
    } else {
      unfoldDrawer();
    }
  });

  $drawer.click(function () {
    packupDrawer();
  });

  // 收起应该点抽屉内容之外，这里需要阻止冒泡
  $drawerContent.click(function (e) {
    e.preventDefault();
    e.stopPropagation();
  });
});
