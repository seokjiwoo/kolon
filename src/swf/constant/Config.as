package constant 
{
	import flash.net.FileFilter;
	
	public class Config 
	{
		public static const FILE_NAME			:String = 'imagePreview';
		public static const FILE_VERSION		:String = 'ver 1.0.0';
		
		public static const SEL_FILE_TYPE 		:FileFilter = new FileFilter( 'images (*.jpg, *.jpeg, *.png)', '*.jpg;*.jpeg;*.png' );
		public static const MUTILPLE_OPTS 		:Object = { enabled : false, maxSize : 3 };
		
		public function Config() 
		{
		}
		
	}

}