package constant 
{
	import flash.net.FileFilter;
	
	/**
	 * @author 	Fishingtree - Dev( hkroh )
	 * @date 	2014. 09.
	 * @description
	 * 	로컬 이미지 > Preview & Upload
	 * 	Config
	 */
	public class Config 
	{
		public static const FILE_NAME			:String = 'imagePreview';
		public static const FILE_VERSION		:String = 'ver 1.0.0';
		public static const UPLOAD_URL			:String = '/upload/imageUpload_proc.asp';
		public static const SEL_FILE_TYPE 		:FileFilter = new FileFilter("Images (*.jpg, *.png)", "*.jpg;*.png");
		
		public function Config() 
		{
		}
		
	}

}