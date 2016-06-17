package net 
{
	import flash.display.*;
	import flash.events.*;
	import flash.net.*;
	
	public class FileLoader extends Sprite
	{
		public var file:FileReference;
		
		private var allTypes:Array = new Array();
		
		/**
		 * 생성자
		 */
        public function FileLoader() 
		{
			super();
			
			this.file = new FileReference();
			configureListeners(this.file);
        }
		
		/*------------------------------------------------------------------------------------------------------- public	*/
		/**
		 * 타입 추가.
		 * @param	type
		 */
		public function addType(type:String):void
		{
			var ffilter:FileFilter = getType(type);
			allTypes.push(ffilter);
		}
		
		/**
		 * 파일 선택
		 */
		public function select():void
		{
			this.file.browse(allTypes);
		}
		
		/**
		 * 파일 업로드
		 */
		public function upload(url:String):void
		{
			var uploadURL:URLRequest = new URLRequest();
			uploadURL.url = url;
			
			this.file.upload(uploadURL);
		}
		/*------------------------------------------------------------------------------------------------------- private	*/
		
		/**
		 * 이벤트 등록
		 * @param	dispatcher
		 */
		private function configureListeners(dispatcher:IEventDispatcher):void 
		{
			dispatcher.addEventListener(Event.CANCEL, cancelHandler);
			dispatcher.addEventListener(Event.COMPLETE, completeHandler);
			dispatcher.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
			dispatcher.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
			dispatcher.addEventListener(Event.OPEN, openHandler);
			dispatcher.addEventListener(ProgressEvent.PROGRESS, progressHandler);
			dispatcher.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
			dispatcher.addEventListener(Event.SELECT, selectHandler);
			dispatcher.addEventListener(DataEvent.UPLOAD_COMPLETE_DATA, uploadCompleteDataHandler);
		}
		
		/*------------------------------------------------------------------------------------------------------- return	*/
		/**
		 * 타입 리턴.
		 * @param	type
		 * @return
		 */
		private function getType(type:String):FileFilter
		{
			var fileType:FileFilter;
			
			switch (type) {
				case "image":
					trace("image");
					fileType = new FileFilter("Images (*.jpg, *.gif, *.png)", "*.jpg; *.gif; *.png");
					break;
				case "text":
					trace("text");
					fileType = new FileFilter("Text Files (*.txt, *.rtf)", "*.txt; *.rtf");
					break;
				case "movie":
					trace("movie");
					fileType = new FileFilter("Text Files (*.avi, *.mpge, *.mov, *.flv, *.mp4, *.wmv)", "*.avi; *.mpge; *.mov; *.flv; *.mp4; *.wmv");
					break;
				case "sound":
					trace("sound");
					fileType = new FileFilter("Text Files (*.mp3, *.wav, *.mid, *.voc)", "*.mp3; *.wav; *.mid; *.voc");
					break;
				case "*":
					trace("*");
					fileType = new FileFilter("모든파일 (*.*)", "*.*");
					break;
				default :
					trace("def");
					fileType = new FileFilter("모든파일 (*.*)", "*.*");
					break;
			}
			
			return fileType;
		}
		
		/*------------------------------------------------------------------------------------------------------- handler	*/
		
		private function cancelHandler(event:Event):void 
		{
			trace("cancelHandler: " + event);
		}
		
		private function completeHandler(event:Event):void 
		{
			trace("completeHandler: " + event);
			this.dispatchEvent(event);
		}
		
		private function uploadCompleteDataHandler(event:DataEvent):void 
		{
			this.dispatchEvent(event);
			trace("uploadCompleteData: " + event);
		}
		
		private function httpStatusHandler(event:HTTPStatusEvent):void 
		{
			trace("httpStatusHandler: " + event);
		}
		
		private function ioErrorHandler(event:IOErrorEvent):void 
		{
			trace("ioErrorHandler: " + event);
		}
		
		private function openHandler(event:Event):void 
		{
			trace("openHandler: " + event);
		}
		
		private function progressHandler(event:ProgressEvent):void 
		{
			var fr:FileReference = FileReference(event.target);
			trace("progressHandler name=" + fr.name + " bytesLoaded=" + event.bytesLoaded + " bytesTotal=" + event.bytesTotal);
		}
		
		private function securityErrorHandler(event:SecurityErrorEvent):void 
		{
			trace("securityErrorHandler: " + event);
		}
		
		private function selectHandler(event:Event):void 
		{
			var fr:FileReference = FileReference(event.target);
			trace("selectHandler: name=" + fr.name);
			this.dispatchEvent(event);
		}
	}
}
