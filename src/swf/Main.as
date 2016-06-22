package 
{
	import flash.display.*;
	import flash.events.*;
	import flash.net.*;
	import flash.system.*;
	import flash.external.ExternalInterface;
	
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
		private var _fileRefList 				:FileReferenceList = new FileReferenceList();
		
		private var _selFileType 				:FileFilter;
		private var _pendingFiles 				:Array;
		private var _multipleOpts 				:Object;

		public var _btnSelect 					:SimpleButton;
		
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
			this._btnSelect = SimpleButton( this._btnSelect );
			
			_selFileType = Config.SEL_FILE_TYPE;
			_multipleOpts = Config.MUTILPLE_OPTS;
			
			setStage();
			setBtn();
			setCallback();
			initListeners();
		}

		private function setStage():void 
		{
			stage.align = StageAlign.TOP_LEFT;
			stage.scaleMode = StageScaleMode.NO_SCALE;
			
			_contextMenu.addCopyRight( ContextMenuVN.DEFAULT_COPY, '' );
			_contextMenu.addVersion( Config.FILE_NAME, Config.FILE_VERSION );
		}		
		
		private function setBtn():void 
		{
			_btnSelect.width = stage.stageWidth;
			_btnSelect.height = stage.stageHeight;
			_btnSelect.addEventListener( MouseEvent.CLICK, btnSelectClick );
		}

		private function setCallback():void 
		{
			if( ExternalInterface.available ) {
				ExternalInterface.addCallback( 'callFlash', addCallbackListener );
				
				ExternalInterface.call( 'FLASH.trace', Config.FILE_NAME + ' addCallback Setting!' );
			} else {
				ExternalInterface.call( 'FLASH.trace', Config.FILE_NAME + ' addCallback Setting Error!' );
			}
			
			ExternalInterface.call( 'FLASH.eventCallback', 'init' );
		}

		private function addCallbackListener( $type:String, $value:Object )
		{
			ExternalInterface.call( 'FLASH.trace', 'addCallbackListener', $type, $value );
			switch( $type ) {
				case 'setFilter':
					_selFileType = new FileFilter($value.filter, $value.type);
					break;
				case 'setMultiple':
					_multipleOpts.enabled = $value.enabled;
					_multipleOpts.maxSize = $value.maxSize;
					break;
			}
		}
		
		private function initListeners():void 
		{
			_fileRef.addEventListener( Event.SELECT, onFileRefSelect );			
			_fileRefList.addEventListener( Event.SELECT, onFileRefSelect );
		}

		private function onFileRefSelect( $e:Event ):void
		{
			var file:FileReference;
			var fileList:Array;
			
			_pendingFiles = new Array();
			
			if (!_multipleOpts.enabled) {
				file = FileReference($e.target);
				addPendingFile(file);
			} else {
				fileList = _fileRefList.fileList;
				for (var i:uint = 0; i < fileList.length; i++) {
					file = FileReference(fileList[i]);
					addPendingFile(file);
				}
			}
			
		}

		private function addPendingFile( $file:FileReference ):void
		{
			_pendingFiles.push($file);
			$file.addEventListener( Event.COMPLETE, onFileRefLoadComplete );
			$file.addEventListener( IOErrorEvent.IO_ERROR, onFileRefError );
			$file.load();
		}

		private function removePendingFile( $file:FileReference ):void
		{
			for (var i:uint; i < _pendingFiles.length; i++) {
				if (_pendingFiles[i].name == $file.name) {
					_pendingFiles.splice(i, 1);
					if (_pendingFiles.length == 0) {
						doOnComplete();
					}
					return;
				}
			}
		}
		
		private function onFileRefError( $e:IOErrorEvent ):void 
		{
			trace( 'IOErrorEvent.IO_ERROR', $e.type, $e.errorID );
			ExternalInterface.call( 'FLASH.trace', 'IOErrorEvent.IO_ERROR' );
		}
		
		private function onFileRefLoadComplete( $e:Event ):void
		{
			var file:FileReference = FileReference( $e.target );
			ExternalInterface.call( 'FLASH.eventCallback', 'selectedFile', {
				file : {
					name : file.name,
					size : file.size,
					type : file.type,
					lastModifiedDate : file.modificationDate,
					lastModified : new Date( file.modificationDate ).getTime()
				},
				bs64 : Base64.encodeByteArray( file.data )
			});
		}

		private function doOnComplete():void {
			trace('end');
		}
		
		private function btnSelectClick( $e:MouseEvent ):void
		{
			if (!_multipleOpts.enabled) {
				_fileRef.browse( [ _selFileType ] );
			} else {
				_fileRefList.browse( [ _selFileType ] );
			}
		}
		
	}
	
}