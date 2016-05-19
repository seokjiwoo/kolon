jQuery(function($) {
	$('#sortToggle').on('click', function(e) {
		e.preventDefault();
		$('.catSort ul').slideToggle();
	});
});