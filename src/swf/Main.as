package 
{
	import flash.display.*;
	import flash.events.*;
	import flash.net.*;
	import flash.system.*;
	import flash.external.ExternalInterface;
	
	import net.*;
	import constant.Config;
	import ui.ContextMenuVN;
	import flash.ui.ContextMenu;
	
	/**
	 * @author 	Fishingtree - Dev( hkroh )
	 * @date 	2014. 09.
	 * @description
	 * 	로컬 이미지 > Preview & Upload
	 * 	브라우저 호환성을 고려 IE 하위버전이나 PC Web에서 사용
	 */
	public class Main extends MovieClip 
	{
		private var _contextMenu				:ContextMenuVN = new ContextMenuVN( this );
		private var _fileRef					:FileReference = new FileReference();
		
		public var _btnSelect 					:SimpleButton;
		public var _containerMc					:MovieClip;
		
		public var mc_preview 					:MovieClip;
		public var mc_upload 					:MovieClip;
		public var mc_loading 					:MovieClip;
		public var sp_event_bg 					:MovieClip;
		
		private var _isSelImg 					:Boolean = false;
		
		public function Main():void 
		{
			if (stage) init();
			else addEventListener( Event.ADDED_TO_STAGE, init );
		}
		
		private function init( $e:Event = null ):void
		{
			
			this.stage.align = StageAlign.TOP_LEFT;
			this.stage.scaleMode = StageScaleMode.NO_SCALE;
			
			removeEventListener( Event.ADDED_TO_STAGE, init );
			
			this._containerMc = this._containerMc;			
			this._btnSelect = SimpleButton( this._btnSelect );
			
			setStage();
			//setCallback();
			setBtn();
			setfileRef();
		}
		
		private function viewStage( $idx:int ):void
		{
			trace( 'viewStage : ', $idx );
			switch( $idx ) {
				case 0:
					this.mc_upload.visible = true;
					this.mc_preview.visible = false;
					this.mc_preview.alpha = 0;
					_isSelImg = false;
					break;
				case 1:
					this.mc_upload.visible = false;
					this.mc_preview.visible = true;
					this.mc_preview.alpha = 1;
					_isSelImg = true;
					ExternalInterface.call( 'trackingCode', '121' );
					break;
			}
			
			
		}
		
		private function viewLoading( $flag:Boolean ):void
		{
			this.mc_loading.visible = $flag;
			if ( $flag ) {
				this.mc_loading.alpha = 1;
				this.mc_loading.gotoAndPlay( 1 );
			} else {
				this.mc_loading.alpha = 0;
			}
		}
		
		private function setCallback():void 
		{
			if( ExternalInterface.available ) {
				ExternalInterface.addCallback( 'sendToFlashEx', addCallbackListener );
				
				ExternalInterface.call( 'FLASH.trace', Config.FILE_NAME + 'addCallback Setting!' );
			} else {
				ExternalInterface.call( 'FLASH.trace', Config.FILE_NAME + 'addCallback Setting Error!' );
			}
			
			ExternalInterface.call( 'FLASH.eventInit' );
		}
		
		private function addCallbackListener( $type:String, $value:Object )
		{
			ExternalInterface.call( 'FLASH.trace', 'addCallbackListener', $type, $value );
			/*
			switch( $type ) {
				case 'init':
					_isSelImg = false;
					_isImgCD = '';
					removeContainer();
					viewStage( 0 );
					setBackground();
					break;
				case 'userInfo':
					_userInfo = $value;
					break;
				case 'img_cd':
					_isImgCD = String( $value );
					removeContainer();
					viewStage( 0 );
					ExternalInterface.call( 'trackingCode', '120' );
					setBackground();
					break;
				case 'kor_word':
					_korWord = String( $value );
					break;
				case 'upload':
					if ( !_isSelImg ) {
						ExternalInterface.call( 'FLASH.eventAlert', '이미지가 선택되지 않았습니다.' );
						return;
					}
					fileRefUpload();
					break;
			}
			*/
		}
		private function setBtn():void 
		{
			_btnSelect.addEventListener( MouseEvent.CLICK, btnSelectClick );
		}
		
		private function setfileRef():void 
		{
			_fileRef.addEventListener( Event.SELECT, fileRefSelect );
			_fileRef.addEventListener( Event.COMPLETE, fileRefLoadComplete );
			_fileRef.addEventListener( DataEvent.UPLOAD_COMPLETE_DATA, fileRefUploaded );
			_fileRef.addEventListener( IOErrorEvent.IO_ERROR, fileRefError );
		}
		
		private function fileRefError( $e:IOErrorEvent ):void 
		{
			trace( 'IOErrorEvent.IO_ERROR', $e.type, $e.errorID );
			ExternalInterface.call( 'FLASH.trace', 'IOErrorEvent.IO_ERROR' );
		}
		
		private function fileRefUpload():void 
		{
			/*
			var header:URLRequestHeader = new URLRequestHeader( "enctype", "multipart/form-data" );
			var urlVars:URLVariables = new URLVariables();
			urlVars.category = _isImgCD;
			urlVars.img_cd = _isImgCD;
			urlVars.kor_word = _korWord || '';
			urlVars.uid = _userInfo.mem_id;
			urlVars.ugb = _userInfo.mem_type;
			
			var urlRequest:URLRequest = new URLRequest();
			urlRequest.method = URLRequestMethod.POST;
			urlRequest.data = urlVars;
			urlRequest.requestHeaders.push( header );
			//urlRequest.contentType = 'multipart/form-data';
			urlRequest.url = Config.UPLOAD_URL;
			_fileRef.upload( urlRequest, 'uploadFile' );
			
			this.viewLoading( true );
			*/
		}
		
		private function fileRefUploaded( $e:DataEvent ):void
		{
			//저장 이름:E:\WEBSITE\WWW.PLAYSHOT2014.COM\upload\UPFOLDER\IMG_9999.JPG<br>파일 크기:
			trace( 'DataEvent.UPLOAD_COMPLETE_DATA : ', $e.data );
			ExternalInterface.call( 'EVENT.eventCallback', $e.data );
			this.viewLoading( false );
			return;
			var data:String = $e.data.toString();
			data = data.split( '저장 이름:' )[ 1 ];
			data = data.split( '<br>파일 크기' )[ 0 ];
			data = data.split( '\\' ).join( '/' );
			data = data.split( 'E:/WEBSITE/' )[ 1 ];
			trace( data );
			ExternalInterface.call( 'FLASH.trace', 'DataEvent.UPLOAD_COMPLETE_DATA : ', data );
			
			if ( data ) {
				ExternalInterface.call( 'EVENT.eventCallback', { 'status' : 'success', 'img' : data } );
			}
			
			this.viewLoading( false );
		}
		
		private function fileRefLoadComplete( $e:Event ):void
		{
			var loader:Loader = new Loader();
			loader.contentLoaderInfo.addEventListener( Event.COMPLETE, loadBytesComplete );
			loader.loadBytes( _fileRef.data );
		}
		
		private function removeContainer():void
		{
			while( _containerMc.numChildren != 0 ) {
				_containerMc.removeChild( _containerMc.getChildAt( _containerMc.numChildren - 1 ) );
			};
			_isSelImg = false;
		}
		
		private function loadBytesComplete( $e:Event ):void
		{
			var loaderInfo:LoaderInfo = $e.target as LoaderInfo;
			loaderInfo.removeEventListener( Event.COMPLETE, loadBytesComplete );
			
			//removeContainer();
			
			var viewWidth:int = 314;
			var viewHeight:int = 233;
			var imgWidth:Number = loaderInfo.content.width;
			var imgHeight:Number = loaderInfo.content.height;
			var imgScaleX:Number = 1;
			var imgScaleY:Number = 1;
			
			// 가로형
			if ( imgWidth > imgHeight ) {
				imgScaleX = viewWidth / imgWidth;
				imgScaleY = imgScaleX;
			} else if ( imgHeight < imgWidth ) {
			// 세로형
				imgScaleY = viewHeight / imgHeight;
				imgScaleX = imgScaleY;
			} else {
			// 정비율
				imgScaleY = viewHeight / imgHeight;
				imgScaleX = imgScaleY;
			}
			
			loaderInfo.content.scaleX = imgScaleX;
			loaderInfo.content.scaleY = imgScaleY;
			
			// 임시로 사이즈 강제로 지정
			if ( loaderInfo.content.width >= viewWidth ) {
				loaderInfo.content.width = viewWidth;
			}
			
			if ( loaderInfo.content.height >= viewHeight ) {
				loaderInfo.content.height = viewHeight;
			}
			
			loaderInfo.content.x = ( viewWidth - loaderInfo.content.width ) / 2;
			loaderInfo.content.y = ( viewHeight - loaderInfo.content.height ) / 2;
			
			_containerMc.addChild( loaderInfo.content );
			//viewStage( 1 );
			_isSelImg = true;
		}
		
		private function fileRefSelect( $e:Event ):void
		{
			_fileRef.load();
		}
		
		private function btnSelectClick( $e:MouseEvent ):void
		{
			_fileRef.browse( [ Config.SEL_FILE_TYPE ] );
		}
		
		private function btnRemoveClick( $e:MouseEvent ):void
		{
			removeContainer();
			ExternalInterface.call( 'trackingCode', '122' );
			ExternalInterface.call( 'trackingCode', '120' );
			viewStage( 0 );
		}
		
		private function setStage():void 
		{
			stage.align = StageAlign.TOP_LEFT;
			stage.scaleMode = StageScaleMode.NO_SCALE;
			
			_contextMenu.addCopyRight( ContextMenuVN.DEFAULT_COPY, '' );
			_contextMenu.addVersion( Config.FILE_NAME, Config.FILE_VERSION );
		}
		
	}
	
}