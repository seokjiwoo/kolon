/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	doc = document,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	imageUploader = require('../../components/ImageUploader.js'),
	fileName = 'qna/Index.js';

	var controller = require('../../controller/OpinionsController.js');
	$(controller).on('opinionsListResult', opinionsListHandler);
	$(controller).on('opinionsExpertsListResult', opinionsExpertsListHandler);

	var opts = {
		colorbox : {
			target : '#colorbox',
			event : {
				COMPLETE : 'cbox_complete',
				CLEANUP : 'cbox_cleanup',
				CLOSED : 'cbox_closed'
			}
		},
		cssClass : {
			popAttachPictures : 'popAttachPictures'
		},
		imageUploader : {
			flashOpts : {
				swf : '../images/swf/imagePreview.swf',
				id : 'imageUpoader',
				width : '100%',
				height : '100%',
				wmode : 'transparent',
				filterOpt : {
					filter : 'images (*.jpg, *.jpeg, *.png)',
					type : '*.jpg;*.jpeg;*.png'
				}
			},
			multiple : {
				enabled : false,
				maxSize : 3
			}
		}
	};

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;
	
	return callerObj;
	
	function init(options) {
		Super.init();

		debug.log(fileName, 'init', $, util);

		self = callerObj;

		setElements();
		setBindEvents();

		controller.opinionsExpertList();
		controller.opinionsList();
	}

	function opinionsListHandler(e, status, result) {
		if (status == 200) {
			var tags = '';

			for (var key in result) {
				var eachOpinion = result[key];
				
				tags += '<li><div class="opinionbox">';
				tags += '<div class="title"><p class="info"><span>'+eachOpinion.userName+'</span><span>'+eachOpinion.createDate+'</span></p></div>';
				
				tags += '<div class="conbox">';
				tags += '<strong><a href="../../_popup/popPhotoDetailView.html" class="btnPop btnPop895" data-user-class="qna popEdge">';
				tags += '<span class="it">'+eachOpinion.category+'</span>'+eachOpinion.title+'</a></strong>';
				tags += '<div class="conboxTxt"><p class="except">'+eachOpinion.content+'</p><span class="more">더보기</span></div>';
				tags += '<div class="commentCount">';
				if (eachOpinion.answers.length == 0) {
					tags += '<p>미답변</p>';
				} else {
					tags += '<p><span>'+eachOpinion.answers.length+'개</span> 의견</p>';
				}
				tags += '<button id="writeCommentButton'+key+'" class="btn btnSizeS btnColor02 writeCommentButton">의견작성</button>';
				tags += '</div>';
				tags += '</div>';

				tags += '<div id="commentArea'+key+'" class="commentArea noMoreBtn">';
				// tags += '<p><a href="#" class="moreBtn"><span>이전 댓글보기</span></a></p>';
				tags += '<ul>';
				for (var answerKey in eachOpinion.answers) {
					var eachAnswer = eachOpinion.answers[answerKey];

					tags += '<li>';
					tags += '<div class="commentName"><div class="name">';
					tags += '<span><img src="'+eachAnswer.expertImageUrl+'" alt="" /></span>';
					tags += '<span><span><em>'+eachAnswer.expertCompany+'</em> '+eachAnswer.expertName+'</span>';
					tags += '<span class="except">'+eachAnswer.serviceNames.join(', ')+'</span></span>';
					tags += '</div></div>';
					tags += '<p class="txt">'+eachAnswer.content+'</p>';
					tags += '<p class="date">'+eachAnswer.createDate+' <i><span>'+eachAnswer.helpCount+'</span></i></p>'; // 스마일 클릭시 도움됨 표시 - <i class="on"><span>30</span></i>
					tags += '</li>';
				}
				tags += '</ul>';
				
				tags += '<div class="commentInput"><form method="post" action="/"><fieldset><legend>댓글 입력 폼</legend><div class="commentTextarea">';
				tags += '<textarea class="pullSize" style="width:99%;" placeholder="댓글을 입력해주세요." title="댓글입력"></textarea>';
				tags += '<div class="commentBtn">';
				tags += '<div class="thumb"><span><img src="../images/temp01.jpg" alt="" /></span></div>';
				tags += '<button class="btn confirmBtn">등록</button>';
				tags += '</div></div></fieldset></form></div>';

				tags += '</div></div></li>';
			}

			$('#opinionList').html(tags);

			$('.writeCommentButton').click(function(e){
				var pId = $(this).attr('id').substr(18);
				$('#commentArea'+pId).addClass('showCommentInput');
			});
			
			$('.except').dotdotdot({watch:'window'});
		} else {
			console.log('통신에러');
		}
		/*
		<li>
			<div class="opinionbox">
				<!-- 의견 내용 -->
				<div class="conbox">
					<strong><a href="../../_popup/popPhotoDetailView.html" class="btnPop btnPop895" data-user-class="qna popEdge"><span class="it">리빙아이템</span>이사갈 계획입니다.</a></strong>
					<div class="conboxTxt">
						<p class="except">새로 이사갈 집이    24평입니다. <br/>고양이랑 같이 살고 있는데 고양이를 위해서 집안 곳곳에 캣타워를 설치 하고 싶습니다.  괜찮은 아이디어가 어떤게 있을까요?고양이랑 같이 살고 있는데 고양이를 위해서 집안 곳곳에 캣타워를 설치 하고 싶습니다. 괜찮은 아이디어가 어떤게 있을까요?이런걸 해주는 업체가 있을까고양이랑 같이 살고 있는데 고양이를 위해서 집안 곳곳에 캣타워를 설치 하고 싶습니다.이런걸 해주는 업체가 있을까고양이랑 같이 살고 있는데 고양이를 위해서 집안 곳곳에 캣타워를 설치 하고 싶습니다.
						</p>
						<span class="more">더보기</span>
					</div>
					<div class="commentCount">
					<p><span>0개</span> 의견 <em>미답변</em></p>
					<a href="#" class="btnSizeS btnColor02">의견작성</a>
					</div>
				</div>
				<!-- 의견 내용 -->
			</div>
		</li>
		*/
	};

	function opinionsExpertsListHandler(e, status, result) {
		if (status == 200) {
			var tags = '';


			for (var key in result) {
				var eachExpert = result[key];
				//if (eachExpert.expertImageUrl == null) eachExpert.expertImageUrl = '../images/temp01.jpg';

				tags += '<li><a href="#"><span class="thumb"><img src="'+eachExpert.expertImageUrl+'" alt="" /></span>';
				tags += '<span class="info">';
				tags += '<strong>'+eachExpert.serviceNames+'</strong>';
				tags += '<span><em>'+eachExpert.expertCompany+'</em> '+eachExpert.expertName+'</span>';
				tags += '<span>'+eachExpert.content+'</span>';
				tags += '</span></a></li>';
			}

			$('#expertList2').html(tags);
		} else {
			console.log('통신에러');
		}
	}

	function setElements() {
		debug.log(fileName, 'setElements');

		self.colorbox = $(opts.colorbox.target);
		$('#expertList').bxSlider({
			minSlides: 5,
			maxSlides: 5,
			pager:false,
			slideWidth: 200,
			slideMargin:20
		});
	}

	function setBindEvents() {
		debug.log(fileName, 'setBindEvents');

		var CB_EVENTS = opts.colorbox.event;

		$(doc).on(CB_EVENTS.COMPLETE, onCboxEventListener)
				.on(CB_EVENTS.CLEANUP, onCboxEventListener)
				.on(CB_EVENTS.CLOSED, onCboxEventListener);

		$(".opinionwrite > .toggleBtn").on("click", function(e){
			e.preventDefault();
			showContent( $(this) );
		});
	}
	
	function showContent(tg){
		if( !tg.hasClass("active") ){
			tg.addClass("active").find("span").text("접기");
			$(".opinionInput").stop().slideDown();
		} else {
			tg.removeClass("active").find("span").text("의견 묻기");
			$(".opinionInput").stop().slideUp();
		};
	};

	function onUploaderSelectedFiles(e, selectedFiles) {
		debug.log(fileName, 'onUploaderSelectedFiles', imageUploader.EVENT.SELECTED_FILES, selectedFiles);
		debug.log(fileName, 'onUploaderSelectedFiles', imageUploader.EVENT.GET_SELECTED_FILES, $(imageUploader).triggerHandler(imageUploader.EVENT.GET_SELECTED_FILES));
	}

	function onUploaderSubmit(e) {
		debug.log(fileName, 'onUploaderSubmit', imageUploader.EVENT.SUBMIT);
		debug.log(fileName, 'onUploaderSubmit', imageUploader.EVENT.GET_SELECTED_FILES, $(imageUploader).triggerHandler(imageUploader.EVENT.GET_SELECTED_FILES));
	}

	function onUploaderCancel(e) {
		debug.log(fileName, 'onUploaderCancel', imageUploader.EVENT.CANCEL);
		debug.log(fileName, 'onUploaderCancel', imageUploader.EVENT.GET_SELECTED_FILES, $(imageUploader).triggerHandler(imageUploader.EVENT.GET_SELECTED_FILES));
	}

	function onCboxEventListener(e) {
		debug.log(fileName, 'onCboxEventListener', e.type);

		var CB_EVENTS = opts.colorbox.event;

		switch(e.type) {
			case CB_EVENTS.COMPLETE:
				if (self.colorbox.hasClass(opts.cssClass.popAttachPictures)) {
					$(imageUploader).on(imageUploader.EVENT.SELECTED_FILES, onUploaderSelectedFiles)
									.on(imageUploader.EVENT.SUBMIT, onUploaderSubmit)
									.on(imageUploader.EVENT.CANCEL, onUploaderCancel);

					imageUploader.init(opts.imageUploader);
				}
				break;
			case CB_EVENTS.CLEANUP:
				if (self.colorbox.hasClass(opts.cssClass.popAttachPictures)) {
					$(imageUploader).off(imageUploader.EVENT.SELECTED_FILES, onUploaderSelectedFiles)
									.off(imageUploader.EVENT.SUBMIT, onUploaderSubmit)
									.off(imageUploader.EVENT.CANCEL, onUploaderCancel);

					imageUploader.destory();
				}
				break;
			case CB_EVENTS.CLOSED:
				break;
		}
	}
};