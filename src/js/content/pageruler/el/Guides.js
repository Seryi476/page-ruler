/**
 * Guide element
 */

(function(pr) {

pr.el.Guides = pr.cls(

	/**
	 * Class constructor
	 * @param {PageRuler.el.Ruler} ruler	The ruler object
	 * @param {string} id					Element id
	 * @param {string} cls					Element class
	 */
	function() {

		var _this = this;

		// define each guide
		var guides = [
			'top-left',
			'top-right',
			'bottom-left',
			'bottom-right'
		];

		// create guide container
		this.dom = pr.El.createEl('div', {
			id: 'guides'
		});

		// set width and height to cover the entire page
		this.dom.style.setProperty('width', pr.Util.px(pr.Dimensions.pageRight), 'important');
		this.dom.style.setProperty('height', pr.Util.px(pr.Dimensions.pageBottom), 'important');

		// loop through each guide
		for (var i=0,ilen=guides.length; i<ilen; i++) {

			// get current guide
			var position = guides[i];

			// set attributes
			var attrs = {
				'id':		'guide-' + position,
				'class':	['guide', 'guide-' + position]
			};

			// get the guide key for later reference
			var key = position.replace(/\-\w/, function(char) {
				return char.toUpperCase().replace('-', '');
			});

			// create dom element
			this[key] = pr.El.createEl('div', attrs);

			// add guide to the container
			pr.El.appendEl(this.dom, this[key]);

		}

		// add container to the body
		pr.El.appendEl(document.body, this.dom);

		// hide guides until we need them
		this.setVisible(this.visible);

		// update guides if the page size changes
		pr.Dimensions.addUpdateCallback(function(width, height) {

			// update guide container width and height
			_this.dom.style.setProperty('width', pr.Util.px(width), 'important');
			_this.dom.style.setProperty('height', pr.Util.px(height), 'important');

			// set guide sizes
			_this.setSizes();

		});

	},
	{

		/**
		 * The dom element
		 * @type {HTMLElement}
		 */
		dom:	null,

		/**
		 * Whether the guides are visible
		 * @type {boolean}
		 */
		visible:	true,

		/**
		 * The top left guide
		 * @type {HTMLElement}
		 */
		topLeft:	null,

		/**
		 * The top right guide
		 * @type {HTMLElement}
		 */
		topRight:	null,

		/**
		 * The bottom left guide
		 * @type {HTMLElement}
		 */
		bottomLeft:	null,

		/**
		 * The bottom right guide
		 * @type {HTMLElement}
		 */
		bottomRight:	null,

		/**
		 * Calls the callback function for each guide, passing each guide as a parameter
		 * @param {function} callback
		 */
		each: function(callback) {

			callback.call(this, this.topLeft);
			callback.call(this, this.topRight);
			callback.call(this, this.bottomLeft);
			callback.call(this, this.bottomRight);

		},

		/**
		 * Sets the border color for the guides
		 * @param {string} hex
		 */
		setColor: function(hex) {

			this.each(function(guide) {

				guide.style.setProperty('border-color', hex, 'important');

			});

		},

		/**
		 * Sets the sizes for all the guides so they line up with the ruler
		 */
		setSizes: function() {

			// show the guides
			this.setVisible(this.visible, false);

			// get ruler for dimensions
			var ruler = pr.elements.ruler;

			// calculate widths from all directions
			// all widths and heights have +1 added to them so they overlap the ruler border and run flush
			// to them
			var leftWidth	= ruler.left + 1;

			var rightWidth	= pr.Dimensions.pageRight - ruler.right + 1
			if (rightWidth < 0) {
				rightWidth = 0;
			}

			var topHeight		= ruler.top + 1;

			var bottomHeight	= pr.Dimensions.pageBottom - ruler.bottom + 1;
			if (bottomHeight < 0) {
				bottomHeight = 0;
			}

			// set top left guide size
			this.topLeft.style.setProperty('width', pr.Util.px(leftWidth), 'important');
			this.topLeft.style.setProperty('height', pr.Util.px(topHeight), 'important');

			// set top right guide size
			this.topRight.style.setProperty('width', pr.Util.px(rightWidth), 'important');
			this.topRight.style.setProperty('height', pr.Util.px(topHeight), 'important');

			// set bottom left guide size
			this.bottomLeft.style.setProperty('width', pr.Util.px(leftWidth), 'important');
			this.bottomLeft.style.setProperty('height', pr.Util.px(bottomHeight), 'important');

			// set bottom right guide size
			this.bottomRight.style.setProperty('width', pr.Util.px(rightWidth), 'important');
			this.bottomRight.style.setProperty('height', pr.Util.px(bottomHeight), 'important');

		},

		/**
		 * Hides all the guides
		 */
		hide: function() {

			this.dom.style.setProperty('display', 'none', 'important');

		},

		/**
		 * Shows all the guides
		 */
		show: function() {

			this.dom.style.removeProperty('display');

		},

		/**
		 * Sets the visibility of the guides
		 * @param {Boolean} visible	Whether the guides should be visible
		 * @param {Boolean} save	Whether to save the visibility setting
		 */
		setVisible: function(visible, save) {

			this.visible = !!visible;

			if (this.visible === true) {

				this.show();

			}
			else {

				this.hide();

			}

			// save it
			if (!!save) {

				chrome.runtime.sendMessage({
					action:		'setGuides',
					visible:	this.visible
				});

			}

		}

	}

);

})(__PageRuler);