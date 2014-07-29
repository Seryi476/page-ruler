/**
 * Page Dimensions
 */

(function(pr) {

pr.Dimensions = {

	/**
	 * Minimum left value the ruler can take
	 * @type Number
	 */
	pageLeft:	0,

	/**
	 * Maximum right value the ruler can take
	 * @type Number
	 */
	pageRight:	document.body.scrollWidth,

	/**
	 * Minimum top value the ruler can take
	 * @type Number
	 */
	pageTop:	0,

	/**
	 * Maximum bottom value the ruler can take
	 * @type Number
	 */
	pageBottom:	document.body.scrollHeight,

	/**
	 * Return the amount the page top has been offset by top margin and the pageruler toolbar
	 * Borrowed from jQuery.offset() method https://github.com/jquery/jquery/blob/master/src/offset.js
	 * @return Number
	 */
	offsetTop:	function() {

		return document.body.getBoundingClientRect().top + window.pageYOffset - document.documentElement.clientTop;

	},

	/**
	 * Return the amount the page left has been offset by left margin
	 * Borrowed from jQuery.offset() method https://github.com/jquery/jquery/blob/master/src/offset.js
	 * @type Number
	 */
	offsetLeft:	function() {

		return document.body.getBoundingClientRect().left + window.pageXOffset - document.documentElement.clientLeft;

	},

	/**
	 * Array of callbacks to apply when the dimensions are updated
	 */
	updateCallbacks:	[],

	/**
	 * Adds an callback function to the callbacks array
	 * @param {function} callback
	 */
	addUpdateCallback:	function(callback) {

		this.updateCallbacks.push(callback);

	},

	/**
	 * Updates the allowable page dimensions and applies all resize callbacks
     * @param {Number} pageWidth    The new page width
     * @param {Number} pageHeight   The new page height
	 */
	update:			function(pageWidth, pageHeight) {

		// update pageRight and pageBottom values
		this.pageRight	= pageWidth;
		this.pageBottom	= pageHeight;

		// loop through all callbacks
		for (var i=0,ilen=this.updateCallbacks.length; i<ilen; i++) {

			// apply callback, passing the new pageRight and pageBottom values as parameters
			this.updateCallbacks[i](this.pageRight, this.pageBottom);

		}

	},

	/**
	 * Removes all update callbacks
	 */
	removeUpdateCallbacks: function() {

		// loop through each callback
		for (var i=0,ilen=this.updateCallbacks.length; i<ilen; i++) {

			// null it
			this.updateCallbacks[i] = null;

		}

		// reset array
		this.updateCallbacks = [];

	}

};

})(__PageRuler);