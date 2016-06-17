/* global $ */

module.exports = function() {
	var popupSize = {
		"530": 530,
		"540": 540,
		"590": 590,
		"650": 650,
		"835": 835,
		"895": 895,
		"1200": 1200
	};
	var winH;

	var loginDataModel = require('../model/LoginModel');
	var loginData = loginDataModel.loginData();
	
	var callerObj = {
		/**
		 * PC/모바일 공통 UI요소 초기화
		 */
		init: init,
		/**
		 * 메시지 팝업 오픈
		 */
		messagePopup: messagePopup,
		/**
		 * HTML 팝업 오픈
		 */
		htmlPopup: htmlPopup,
		/**
		 * 육각형 Alert 팝업 오픈
		 */
		alertPopup: alertPopup,
		/**
		 * 로그인 상태 정보
		 */
		loginData: loginData
	};
	
	return callerObj;
	
	function init() {
		winH = $(window).height();
		
		initTab();
		initTabContentLayout();

		$('.radioBox label').click(radioButtonHandler);	// radio button
		$('.checkbox label').click(checkBoxHandler);	// checkbox
		$('.btnPop').click(htmlPopupLinkHandler);		// basic Popup
	};
	
	/**
	 * initalize radio button
	 */
	function radioButtonHandler(e) {
		$(this).addClass('on').siblings('label').removeClass('on');
	};
	
	/**
	 * initalize checkbox
	 */
	function checkBoxHandler(e) {
		if ($(this).siblings('input').val() != ':checked'){			
			$(this).toggleClass('on');
		}
	};
	
	/**
	 * initalize page tab
	 */
	function initTab() {
		$('.tabWrap a').on('click', function(e) {// common tab
			e.preventDefault();
			var tabBtn = $(this);
			var tabCon = $(this).attr('href');
			
			$(tabBtn).parent().addClass('on').siblings().removeClass('on');
			$(tabCon).show().siblings().hide();
			
			initTabContentLayout();
		});
	};

	/**
	 * init current tab layout
	 */
	function initTabContentLayout() {
		if ($('ul').hasClass('cardWrap')) initCardLayout();
		if ($('ul').hasClass('infoSlider')) initTabSlider();
		if ($('p').hasClass('except')) $('.except').dotdotdot({watch:'window'});
		if ($('p').hasClass('except02')) {
			$('.except02').dotdotdot({
				after: 'a.readmore',
				watch:'window',
				callback:function(){
					$('.readmore').on('click', function(e) { // more slideDown
						e.preventDefault();
						$(this).parent('p').siblings('.slideCon').slideDown();
						$(this).parent('.except02').trigger('destroy').css('max-height','none').find('a').remove();
					});
				}
			});
		}
	};
	
	/**
	 * slide in detail page
	 */
	function initTabSlider() { 
		$('#infoSlider').bxSlider({
			pager:false
		});
	};
	
	/**
	 * card layout
	 */
	function initCardLayout() {
		$('#cardWrap').isotope({
			itemSelector: '#cardWrap > li',
			masonry: {
				columnWidth: 100,
				gutter: 1
			}
		});
	};
	
	function htmlPopupLinkHandler(e) {
		e.preventDefault();
		var popupFile = $(this).attr('href');
		if (popupFile != '#') {
			var userClass = $(this).data('userClass') == undefined ? '' : $(this).data('userClass');
			var width = '100%';
			
			for (var key in popupSize) {
				if ($(this).hasClass('btnPop'+key)) width = popupSize[key];
			};
			
			htmlPopup(popupFile, width, userClass);
		}
	};
	
	function messagePopup(title, subTitle, popupContent, width, userClass) {
		if (width == undefined) width = 540;
		if (String(width).substr(-1) != '%') width += "px";
		
		var inline = '<div class="popTop"><h4 class="popTit">'+title+'</h4></div><div class="popCon"><p class="subTit">'+subTitle+'</p><div class="popScroll">'+popupContent+'</div></div>';
		openPopup(inline, width, userClass);
	};
	
	function htmlPopup(src, width, userClass) {
		if (width == undefined) width = 540;
		if (String(width).substr(-1) != '%') width += "px";
		
		openPopup(src, width, userClass);
	};

	function alertPopup(title, description, buttonCaption) {
		var inline = '<div class="popHex cardSize01"><div class="hexagon"><div class="hexTop"><span></span></div><div class="hexBottom"><span></span></div></div>';
		inline += '<div class="cardCon"><h4 class="popTit">'+title+'</h4>';
		inline += '<p class="popSub">'+description+'</p>';
		inline += '<p class="btnWrap"><a href="#" class="btnSizeM btnColor02">'+buttonCaption+'</a></p>';
		inline += '</div></div>';

		openPopup(inline, 280, 'hexAlert');
		/*
		<div class="popHex cardSize02">
			<div class="hexagon">
				<div class="hexTop"><span></span></div>
				<div class="hexBottom"><span></span></div>
			</div>
			<div class="cardCon">
				<h3 class="popTit">1644-1234</h3>
				<p class="popSub">궁금한 것은 언제든지 물어보세요</p>
				<form action="">
					<fieldset class="popCon">
						<legend class="hide">전화상담 번호 입력</legend>
						<p class="productInfo">보고있는 상품 번호는<br><b>AB000012345</b> 입니다.</p>
						<p class="phoneWrp">
							<select name="" id="">
								<option value="010">010</option>
								<option value="011">011</option>
								<option value="012">012</option>
								<option value="012">019</option>
							</select>
							<label for="phone01" class="hide">전화번호 앞자리</label>
							<input type="text" id="phone01" maxlength="4">
							<label for="phone02" class="hide">전화번호 뒷자리</label>
							<input type="text" id="phone02" maxlength="4">
						</p>
						<button type="submit" class="popSubmit">상담받기</button>
					</fieldset>
				</form>
				<p class="note"><b>상담 받기 버튼</b>을 누르시면 <br>상담원이 바로 고객님께 연락 드리겠습니다. <br><b>연락 받을 전화 번호를 확인해 주세요.</b></p>
			</div>
		</div>
		*/
	}
	
	function openPopup(content, width, userClass) {
		var popupFile = false;
		var popupContent = false;
		var fixed = (userClass.indexOf('absolutePosition') != -1);
		
		if (content.indexOf('.html') != -1) {
			popupFile = content;
		} else {
			popupContent = content;
		}
		
		$.colorbox({
			href: popupFile,
			html: popupContent,
			width: width,
			fixed: fixed,
			className: "lyPop "+userClass,
			transition: "none",
			speed: 0,
			opacity: 0.5,
			initialWidth: "0",
			initialHeight: "0",
			onComplete: function() {
				$('.popScroll').css('height', winH-490+'px');
				$.colorbox.resize();
			}
		});
	};
}