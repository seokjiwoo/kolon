package ui
{	
	import flash.display.*;
	import flash.events.*;
	import flash.net.*;
	import flash.ui.*;
	
	public class ContextMenuVN
	{
		private var _parentMenu						:ContextMenu;
		private var _copyItem						:ContextMenuItem;
		private var _fileName						:ContextMenuItem;
		private var _versionItem					:ContextMenuItem;
		private var _copyURL						:String;
		public static const DEFAULT_COPY			:String = "Created by Vinyl-X";
		public static const DEFAULT_COPY_URL		:String = "http://x.vi-nyl.com/";
		
		/**
		 * ContextMenuVN
		 * @param $this
		 */	
		public function ContextMenuVN( $this )
		{	
			_parentMenu = new ContextMenu();
			
			_parentMenu.hideBuiltInItems();
			$this.contextMenu = _parentMenu;
		}
		
		/**
		 * ContextMenuVN	-	removeDefaultItems	-	기본 컨텍스트메뉴 비활성화
		 */
		public function removeDefaultItems():void
		{
			_parentMenu.hideBuiltInItems();
		}
		
		/**
		 * ContextMenuVN	-	addCopyRight	-	컨텍스트메뉴 카피 설정
		 * @param $copy		String	문구
		 * @param $url		String	링크
		 * @param $flag		Boolean	활성화유무
		 */
		public function addCopyRight( $copy:String, $url:String, $flag:Boolean = true ):void
		{
			_copyItem = new ContextMenuItem( $copy, false, $flag );
			addCustomMenuItems( _copyItem );
			
			if ( $url.length > 1 )
			{
				_copyURL = $url;
				_copyItem.addEventListener( ContextMenuEvent.MENU_ITEM_SELECT, selectHandler );
			}
		}
		
		/**
		 * ContextMenuVN	-	selectHandler	-	컨텍스트메뉴 카피 클릭 이벤트
		 * @param $e		ContextMenuEvent
		 */
		public function selectHandler( $e:ContextMenuEvent ):void
		{
			navigateToURL( new URLRequest( _copyURL ) , "_blank" );
		}
		
		/**
		 * ContextMenuVN	-	addFileName	-	컨텍스트메뉴 파일명 설정
		 * @param $file		String	파일명
		 * @param $flag		Boolean	활성화유무
		 */
		public function addFileName( $file:String, $flag:Boolean = false ):void
		{
			_fileName = new ContextMenuItem( $file, false, $flag );
			addCustomMenuItems( _fileName );
		}
		
		/**
		 * ContextMenuVN	-	addVersion	-	컨텍스트메뉴 버전정보 설정
		 * @param $file	파일명
		 * @param $version	버전정보
		 * @param $flag	활성화유무
		 */
		public function addVersion( $file:String = "", $version:String = "Ver", $flag:Boolean = false ):void
		{
			var str:String;
			
			if ( $file.length > 1 )		str = $file + " - " + $version;
			else						str = $version;
			
			_versionItem = new ContextMenuItem( str, false, $flag );
			addCustomMenuItems( _versionItem );
		}
		
		/**
		 * ContextMenuVN	-	addCustomMenuItems	-	컨텍스트메뉴 아이템 등록
		 */
		public function addCustomMenuItems( $item ):void 
		{
			_parentMenu.customItems.push( $item );
		}
		
	}
}