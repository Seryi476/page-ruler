
/**
 * Toolbar element
 */

(function(pr) {

pr.el.Toolbar = pr.cls(

	/**
	 * Constructor
	 */
	function() {

		var _this = this;

		// create dom element
		this.dom = pr.El.createEl(
			'div',
			{
				'id':	'toolbar',
				'cls':	this.position
			},
			{
				click: function(e) {
					e.stopPropagation();
				},
				mousedown: function(e) {
					e.stopPropagation();
				}
			}
		);

		// create container
		var container = pr.El.createEl('div', {
			'id':		'toolbar-container',
			'class':	'toolbar-container'
		});

		// create contents
		var closeContainer			= this.generateCloseContainer();
		var dockContainer			= this.generateDockContainer();
		var elementModeContainer	= this.generateElementModeToggleContainer();
		var dimensionsContainer		= this.generateDimensionsContainer();
		var positionContainer		= this.generatePositionContainer();
		var colorContainer			= this.generateColorContainer();

		// add contents to container
		pr.El.appendEl(container, [
			closeContainer,
			dockContainer,
			elementModeContainer,
			dimensionsContainer,
			positionContainer,
			colorContainer
		]);

		this.elementToolbar = new pr.el.ElementToolbar(this);

		// add container to toolbar
		pr.El.appendEl(this.dom, [
			container,
			this.elementToolbar.dom
		]);

		// add toolbar to the document root
		// this is so that the page shift on the body doesn't apply to the toolbar
		pr.El.appendEl(document.documentElement, this.dom);

		// set the toolbar dock position from last time
		chrome.runtime.sendMessage(
			{
				action:	'getDockPosition'
			},
			function(position) {

				_this.setDockPosition(position);

			}
		);

	},
	{

		/**
		 * Toolbar position: top or bottom
		 */
		position:	'top',

		/**
		 * Toolbar height
		 */
		height:		30,

		/**
		 * Ruler element
		 * @type {PageRuler.el.Ruler}
		 */
		ruler:		null,

		/**
		 * The toolbar dom
		 * @type {HTMLElement}
		 */
		dom:		null,

		/**
		 * Container for the elements within the toolbar
		 */
		els:		{},

		/**
		 * Whether element mode is enabled
		 * @type {boolean}
		 */
		elementMode:	false,

		/**
		 * Element toolbar reference
		 * @type {PageRuler.el.ElementToolbar}
		 */
		elementToolbar:	null,

		/**
		 * Generates a pixel input field, with container and label
		 * @param {string} id				Input id
		 * @param {string} labelText		Input label text
		 * @param {function} changeListener	Value change listener
		 * @returns {HTMLElement}
		 */
		generatePixelInput: function(id, labelText, changeListener) {

			// create container
			var container = pr.El.createEl('div', {
				'id':	'toolbar-' + id + '-container',
				'cls':	'px-container'
			});

			// create label
			var label = pr.El.createEl('label', {
				'id':	'toolbar-' + id + '-label',
				'for':	'toolbar-' + id
			}, {}, labelText + ':');

			// create input
			this.els[id] = pr.El.createEl('input', {
				'id':		'toolbar-' + id,
				'type':		'number',
				'min':		0,
				'value':	0,
				'title':	labelText.toLocaleLowerCase()
			});

			// change listener
			pr.El.registerListener(this.els[id], 'change', changeListener);

			// keypress listener
			pr.El.registerListener(this.els[id], 'keydown', function(e) {

				// if shift key and up or down change value by 10
				if (e.shiftKey && (e.keyCode === 38 || e.keyCode === 40)) {

					e.preventDefault();

					// up
					if (e.keyCode === 38) {
						this.value = parseInt(this.value, 10) + 10;
					}
					// down
					else if (e.keyCode === 40) {
						this.value = parseInt(this.value, 10) - 10;
					}

					changeListener.call(this, e);

				}

				// if enter is pressed
				if (e.keyCode === 13) {

					// fire listener
					changeListener.call(this, e);

				}

			});

			// focus listener
			pr.El.registerListener(this.els[id], 'focus', function(e) {
				pr.keyMoving = false;
			});

			// blur listener
			pr.El.registerListener(this.els[id], 'blur', function(e) {
				pr.keyMoving = true;
			});

			// add label and input to container
			pr.El.appendEl(container, [
				label,
				this.els[id]
			]);

			// return container
			return container;

		},

		/**
		 * Shifts the page so that the toolbar does not overlap it
		 */
		shiftPage: function(height) {

			// reset any previous shifts
			this.unshiftPage();

			// auto calculate height if not specified
			height = height || this.height + (this.elementMode ? this.elementToolbar.height : 0);

			// toolbar in top dock position
			if (this.position === 'top') {

				var cssTransform = 'transform' in document.body.style ? 'transform' : '-webkit-transform';
				document.body.style.setProperty(cssTransform, 'translateY(' + pr.Util.px(height) + ')', 'important');

			}
			// toolbar in bottom dock position
			else {

				document.body.style.setProperty('margin-bottom', pr.Util.px(height), 'important');

			}

		},

		/**
		 * Resets the page shift so it goes back to it's original position once the toolbar is removed
		 */
		unshiftPage: function() {

			// remove css transform from 'top' dock
			var cssTransform = 'transform' in document.body.style ? 'transform' : '-webkit-transform';
			document.body.style.removeProperty(cssTransform);

			// remove margin-bottom from bottom dock
			document.body.style.removeProperty('margin-bottom');

		},

		/**
		 * Generates the container for the element mode toggle
		 */
		generateElementModeToggleContainer: function() {

			var _this = this;

			var label = pr.El.createEl('span', {
				'id':		'toolbar-element-toggle-label',
				'style':	'display:none !important;'
			}, {}, pr.Util.locale('toolbarEnableElementMode'));

			var img = pr.El.createEl('img', {
				'id':	'toolbar-element-toggle-img',
				'src':	chrome.extension.getURL("images/element-mode-toggle.png")
			});

			var container = pr.El.createEl('div', {
				'id':	'toolbar-element-toggle',
				'cls':	['container', 'element-toggle-container']
			}, {
				'mouseover': function(e) {
					label.style.removeProperty('display');
				},
				'mouseout': function(e) {
					if (_this.elementMode === false) {
						label.style.setProperty('display', 'none', 'important');
					}
				},
				'click': function(e) {
					e.preventDefault();
					e.stopPropagation();
					if (_this.elementMode === false) {
						_this.showElementToolbar();
					}
					else {
						_this.hideElementToolbar();
					}
				}
			});

			pr.El.appendEl(container, [
				label,
				img
			]);

			return container;

		},

		/**
		 * Generates the container for the width and height inputs
		 * @returns {HTMLElement}
		 */
		generateDimensionsContainer: function() {

			var _this = this;

			// create container
			var container	= pr.El.createEl('div', {
				'id':	'toolbar-dimensions',
				'cls':	'container'
			});

			// create width input
			var width	= this.generatePixelInput(
				'width',
				pr.Util.locale('toolbarWidth'),
				function(e) {
					_this.ruler.setWidth(this.value);

					// track event
					chrome.runtime.sendMessage(
						{
							action:	'trackEvent',
							args:	['Action', 'Ruler Change', 'Width']
						}
					);

				}
			);

			// create height input
			var height	= this.generatePixelInput(
				'height',
				pr.Util.locale('toolbarHeight'),
				function(e) {
					_this.ruler.setHeight(this.value);

					// track event
					chrome.runtime.sendMessage(
						{
							action:	'trackEvent',
							args:	['Action', 'Ruler Change', 'Height']
						}
					);
				}
			);

			// add inputs to container
			pr.El.appendEl(container, [
				width,
				height
			]);

			// return container
			return container;

		},

		/**
		 * Generates the container for the left, right, top and bottom inputs
		 * @returns {HTMLElement}
		 */
		generatePositionContainer: function() {

			var _this = this;

			// create container
			var container	= pr.El.createEl('div', {
				'id':	'toolbar-positions',
				'cls':	'container'
			});

			// create left input
			var left	= this.generatePixelInput(
				'left',
				pr.Util.locale('toolbarLeft'),
				function(e) {
					_this.ruler.setLeft(this.value, true);

					// track event
					chrome.runtime.sendMessage(
						{
							action:	'trackEvent',
							args:	['Action', 'Ruler Change', 'Left']
						}
					);
				}
			);

			// create top input
			var top		= this.generatePixelInput(
				'top',
				pr.Util.locale('toolbarTop'),
				function(e) {
					_this.ruler.setTop(this.value, true);

					// track event
					chrome.runtime.sendMessage(
						{
							action:	'trackEvent',
							args:	['Action', 'Ruler Change', 'Top']
						}
					);
				}
			);

			// create right input
			var right	= this.generatePixelInput(
				'right',
				pr.Util.locale('toolbarRight'),
				function(e) {
					_this.ruler.setRight(this.value, true);

					// track event
					chrome.runtime.sendMessage(
						{
							action:	'trackEvent',
							args:	['Action', 'Ruler Change', 'Right']
						}
					);
				}
			);

			// create bottom input
			var bottom	= this.generatePixelInput(
				'bottom',
				pr.Util.locale('toolbarBottom'),
				function(e) {
					_this.ruler.setBottom(this.value, true);

					// track event
					chrome.runtime.sendMessage(
						{
							action:	'trackEvent',
							args:	['Action', 'Ruler Change', 'Bottom']
						}
					);
				}
			);

			// add inputs to container
			pr.El.appendEl(container, [
				left,
				top,
				right,
				bottom
			]);

			// return container
			return container;

		},

		/**
		 * Generates the container for the color input
		 * @returns {HTMLElement}
		 */
		generateColorContainer: function() {

			var _this = this;

			// create container
			var container	= pr.El.createEl('div', {
				'id':		'toolbar-color-container',
				'class':	'container'
			});

			// create label
			var label = pr.El.createEl('label', {
				'id':	'toolbar-color-label',
				'for':	'toolbar-color'
			}, {}, pr.Util.locale('toolbarColor') + ':');

			// create input
			this.els.color = pr.El.createEl('input', {
				'id':		'toolbar-color',
				'type':		'color'
			});

			// set change event on the input
			pr.El.registerListener(this.els.color, 'change', function(e) {
				_this.ruler.setColor(e.target.value, true);
			});

			// add the label and input to the container
			pr.El.appendEl(container, [
				label,
				this.els.color
			]);

			// return container
			return container;

		},

		/**
		 * Generates the container for the element mode toggle
		 * @returns {HTMLElement}
		 */
		generateCloseContainer: function() {

			var _this = this;

			// create container
			var container	= pr.El.createEl('div', {
				'id':		'toolbar-close-container',
				'class':	['container', 'close-container']
			});

			// create close button
			var img = pr.El.createEl(
				'img',
				{
					'id':		'toolbar-close',
					'src':		chrome.extension.getURL("images/close.png"),
					'title':	pr.Util.locale('toolbarClose', 'lowercase')
				},
				{
					'click': function(e) {
						chrome.runtime.sendMessage({
							action: 'disable'
						});
					}
				}
			);

			// add the label and input to the container
			pr.El.appendEl(container, [
				img
			]);

			// return container
			return container;

		},

		/**
		 * Generates the container for the element mode toggle
		 * @returns {HTMLElement}
		 */
		generateDockContainer: function() {

			var _this = this;

			// create container
			var container	= pr.El.createEl('div', {
				'id':		'toolbar-dock-container',
				'class':	['container', 'dock-container']
			});

			// create dock button
			this.els.dock = pr.El.createEl(
				'img',
				{
					'id':		'toolbar-dock',
					'src':		chrome.extension.getURL("images/dock-bottom.png"),
					'title':	pr.Util.locale('toolbarDockBottom', 'lowercase')
				},
				{
					'click': function(e) {

						_this.setDockPosition(_this.position === 'top' ? 'bottom' : 'top', true);
					}
				}
			);

			// add the label and input to the container
			pr.El.appendEl(container, [
				this.els.dock
			]);

			// return container
			return container;

		},

		setDockPosition: function(position, save) {

			// make sure position is valid
			if (position !== 'top' && position !== 'bottom') {
				return;
			}

			// save old position for convenience
			var oldPosition = position === 'top' ? 'bottom' : 'top';

			// remove old dock class
			pr.El.removeClass(this.dom, 'page-ruler-' + oldPosition);

			// set new dock position
			this.position = position;

			// add new dock class
			pr.El.addClass(this.dom, 'page-ruler-' + position);

			// change dock image
			this.els.dock.setAttribute('src', chrome.extension.getURL('images/dock-' + oldPosition + '.png'));

			// change dock image title
			this.els.dock.setAttribute('title', pr.Util.locale('toolbarDock' + (oldPosition === 'top' ? 'Top' : 'Bottom'), 'lowercase'));

			// re-shift page
			this.shiftPage();

			// save position
			if (!!save) {
				chrome.runtime.sendMessage({
					action:		'setDockPosition',
					position:	position
				});
			}

		},

		/**
		 * Sets the color on the color input
		 * @param {string} color
		 */
		setColor: function(color) {

			this.els.color.value = color;

		},

        /**
         * Sets the value of the width element
         * @param {Number} width
         */
        setWidth: function(width) {

            this.els.width.value = parseInt(width, 10);

        },

        /**
         * Sets the value of the height element
         * @param {Number} height
         */
        setHeight: function(height) {

            this.els.height.value = parseInt(height, 10);

        },

        /**
         * Sets the value of the top element
         * @param {Number} top
         */
        setTop: function(top) {

            this.els.top.value = parseInt(top, 10);

        },

        /**
         * Sets the value of the bottom element
         * @param {Number} bottom
         */
        setBottom: function(bottom) {

            this.els.bottom.value = parseInt(bottom, 10);

        },

        /**
         * Sets the value of the left element
         * @param {Number} left
         */
        setLeft: function(left) {

            this.els.left.value = parseInt(left, 10);

        },

        /**
         * Sets the value of the right element
         * @param {Number} right
         */
        setRight: function(right) {

            this.els.right.value = parseInt(right, 10);

        },

		showElementToolbar: function() {

			this.elementMode = true;

			this.elementToolbar.show();

			document.getElementById('page-ruler-toolbar-element-toggle-label').innerText = pr.Util.locale('toolbarDisableElementMode');

		},

		hideElementToolbar: function() {

			this.elementMode = false;

			this.elementToolbar.hide();

			document.getElementById('page-ruler-toolbar-element-toggle-label').innerText = pr.Util.locale('toolbarEnableElementMode');

		},

		/**
		 * Blurs all inputs to remove their focus
		 */
		blurInputs: function() {

			this.els.width.blur();
			this.els.height.blur();
			this.els.top.blur();
			this.els.bottom.blur();
			this.els.left.blur();
			this.els.right.blur();

		}

	}
);

})(__PageRuler);