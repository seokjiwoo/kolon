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
	
	import flash.utils.ByteArray;
	import flash.geom.Rectangle;
	
	import com.hurlant.util.*;
	
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
		private var _bs64 						:String = '';
		private var _bs64Type 					:String = '';
		
		private var SEL_FILE_TYPE 				:FileFilter;
		private var UPLOAD_URL 					:String;
		private var UPLOAD_JS 					:Boolean = false;
		
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
			
			this._containerMc = MovieClip( this._containerMc );
			this._btnSelect = SimpleButton( this._btnSelect );
			
			SEL_FILE_TYPE = Config.SEL_FILE_TYPE;
			UPLOAD_URL = Config.UPLOAD_URL;
			
			setStage();
			setCallback();
			setBtn();
			setfileRef();
		}
		
		private function setCallback():void 
		{
			if( ExternalInterface.available ) {
				ExternalInterface.addCallback( 'callFlash', addCallbackListener );
				
				ExternalInterface.call( 'FLASH.trace', Config.FILE_NAME + 'addCallback Setting!' );
			} else {
				ExternalInterface.call( 'FLASH.trace', Config.FILE_NAME + 'addCallback Setting Error!' );
			}
			
			ExternalInterface.call( 'FLASH.eventCallback', 'init' );
		}
		
		private function addCallbackListener( $type:String, $value:Object )
		{
			ExternalInterface.call( 'FLASH.trace', 'addCallbackListener', $type, $value );
			switch( $type ) {
				case 'setFilter':
					SEL_FILE_TYPE = new FileFilter($value.filter, $value.type);
					break;
				case 'setUpload':
					if ($value.url) {
						UPLOAD_URL = $value.url;
					}
					
					if ($value.jsCallBack) {
						UPLOAD_JS = $value.jsCallBack;
					}
					break;
				case 'isSelected':
					return _isSelImg;
					break;
				case 'cancel':
					removeContainer();
					_isSelImg = false;
					_bs64 = '';
					break;
				case 'upload':
					if ( !_isSelImg ) {
						return false;
					} else {
						if (UPLOAD_JS) {
							return { bs64 : _bs64, type : _bs64Type };
						} else {
							fileRefUpload();
						}
					}
					break;
			}
		}
		
		private function setBtn():void 
		{
			_btnSelect.width = stage.stageWidth;
			_btnSelect.height = stage.stageHeight;
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
			var header:URLRequestHeader = new URLRequestHeader( 'enctype', 'multipart/form-data' );
			var urlVars:URLVariables = new URLVariables();			
			var urlRequest:URLRequest = new URLRequest();
			urlRequest.method = URLRequestMethod.POST;
			urlRequest.data = urlVars;
			urlRequest.requestHeaders.push( header );
			urlRequest.url = UPLOAD_URL;
			_fileRef.upload( urlRequest, 'uploadFile' );
		}
		
		private function fileRefUploaded( $e:DataEvent ):void
		{
			ExternalInterface.call( 'FLASH.eventCallback', 'uploadDone', $e);
		}
		
		private function fileRefLoadComplete( $e:Event ):void
		{
			var loader:Loader = new Loader();
			loader.contentLoaderInfo.addEventListener( Event.COMPLETE, loadBytesComplete );
			loader.loadBytes( _fileRef.data );
			
			_bs64 = Base64.encodeByteArray( _fileRef.data );
			_bs64Type = _fileRef.type;
			
			ExternalInterface.call( 'FLASH.eventCallback', 'selectedFile', { 
			   name : _fileRef.name,
			   size : _fileRef.size,
			   type : _fileRef.type,
			   lastModifiedDate : _fileRef.modificationDate,
			   lastModified : new Date(_fileRef.modificationDate).getTime()
			});
			ExternalInterface.call( 'FLASH.eventCallback', 'bs64', {
				bs64 : _bs64,
				type : _bs64Type
			});
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
			removeContainer();
			
			var viewWidth:int = stage.stageWidth;
			var viewHeight:int = stage.stageHeight;
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
			_isSelImg = true;
		}
		
		private function fileRefSelect( $e:Event ):void
		{
			_fileRef.load();
		}
		
		private function btnSelectClick( $e:MouseEvent ):void
		{
			//new FileReferenceList().browse( [ SEL_FILE_TYPE ] );
			_fileRef.browse( [ SEL_FILE_TYPE ] );
		}
		
		private function btnRemoveClick( $e:MouseEvent ):void
		{
			removeContainer();
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