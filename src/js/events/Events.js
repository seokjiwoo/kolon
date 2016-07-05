/* jshint node: true, strict: true */
module.exports = Events().getInstance();

function Events() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../utils/Console.js'),
	fileName = 'events/Events.js';

	var Events = {
		// @see http://www.jacklmoore.com/colorbox/
		COLOR_BOX : {
			OPEN : 'cbox_open',
			LOAD : 'cbox_load',
			COMPLETE : 'cbox_complete',
			CLEANUP : 'cbox_cleanup',
			CLOSED : 'cbox_closed',
			PURGE : 'cbox_purge',


			APPEND : 'VX-COLORBOX_AREA-APPEND',
			REFRESH : 'VX-COLORBOX_AREA-REFRESH',
			DESTROY : 'VX-COLORBOX_AREA-DESTROY'
		},
		ISOTOPE : {
			APPEND : 'VX-ISOTOPE-APPEND',
			REFRESH : 'VX-ISOTOPE-REFRESH',
			DESTROY : 'VX-ISOTOPE-DESTROY'
		},
		SCRAP : {
			LIST : 'scrapListResult',
			IMAGE_LIST : 'scrapImageListResult',
			ADD_SCRAP : 'addScrapResult',
			EDIT_SCRAP : 'editScrapResult',
			DELETE_SCRAP : 'deleteScrapResult',
			ADD_SCRAP_FOLDER : 'addScrapFolderResult',
			EDIT_SCRAP_FOLDER : 'editScrapFolderResult',
			DELETE_SCRAP_FOLDER : 'deleteScrapFolderResult'
		}
	},
	instance;

	$.each(Events, function(index, category) {
		var events = [];
		$.each(category, function(index, val) {
			events.push(val);
		});
		category.WILD_CARD = events.join(' ');
	});

	return {
		getInstance: function() {
			if (!instance) {
				instance = Events;
			}
			
			debug.log(fileName, 'getInstance', instance);
			return instance;
		}
	};

}