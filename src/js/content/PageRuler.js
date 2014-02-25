// strict mode
"use strict";

window.__PageRuler = {

	/**
	 * Whether the addon is active on the page
	 * @type {boolean}
	 */
	active:		false,

	/**
	 * PageRuler.el namespace
	 */
	el:			{},

	/**
	 * Storage for ruler elements
	 */
	elements:	{
		toolbar:	null,
		mask:		null,
		ruler:		null
	},

	/**
	 * Ruler enable code
	 * Activates the addon and sets up everything for it
	 */
	enable: function() {

		var _this = this;
				
		// insert styles
		var styles = this.El.createEl('link', {
			'id':	'styles',
			'rel':	'stylesheet',
			'href':	chrome.extension.getURL('content.css') + '?' + this.version
		});
		this.El.appendEl(document.head || document.body || document.documentElement, styles);

		// create toolbar
		this.elements.toolbar = new this.el.Toolbar();

		// create mask
		this.elements.mask = new this.el.Mask();

        // create ruler
        this.elements.ruler = new this.el.Ruler(this.elements.toolbar);

		// update page dimensions on resize
		this.El.registerListener(window, 'resize', function() {
			_this.Dimensions.update();
		});

		// register keyboard movement events
		this.El.registerListener(window, 'keydown', function(e) {

			// only if key moving is enabled
			if (_this.keyMoving) {

				// ctrl = expand
				// ctrl+alt = shrink
				// shift = move 10 pixels instead of 1

				// set the modifier via the shift key
				var modifier = e.shiftKey && 10 || 1;

				var action = (e.ctrlKey || e.metaKey) ? (e.altKey ? 'shrink' : 'expand') : 'move';

				// define actions for each key
				var actions = {
					up: {
						move: function() {
							_this.elements.ruler.setTop(_this.elements.ruler.top - modifier);
						},
						expand: function() {
							_this.elements.ruler.setTop(_this.elements.ruler.top - modifier);
							_this.elements.ruler.setHeight(_this.elements.ruler.height + modifier);
						},
						shrink: function() {
							_this.elements.ruler.setHeight(_this.elements.ruler.height - modifier);
						}
					},
					down: {
						move: function() {
							_this.elements.ruler.setTop(_this.elements.ruler.top + modifier);
						},
						expand: function() {
							_this.elements.ruler.setBottom(_this.elements.ruler.bottom + modifier);
							_this.elements.ruler.setHeight(_this.elements.ruler.height + modifier);
						},
						shrink: function() {
							_this.elements.ruler.setTop(_this.elements.ruler.top + modifier);
							_this.elements.ruler.setHeight(_this.elements.ruler.height - modifier);
						}
					},
					left: {
						move: function() {
							_this.elements.ruler.setLeft(_this.elements.ruler.left - modifier);
						},
						expand: function() {
							_this.elements.ruler.setLeft(_this.elements.ruler.left - modifier);
							_this.elements.ruler.setWidth(_this.elements.ruler.width + modifier);
						},
						shrink: function() {
							_this.elements.ruler.setWidth(_this.elements.ruler.width - modifier);
						}
					},
					right: {
						move: function() {
							_this.elements.ruler.setLeft(_this.elements.ruler.left + modifier);
						},
						expand: function() {
							_this.elements.ruler.setRight(_this.elements.ruler.right + modifier);
							_this.elements.ruler.setWidth(_this.elements.ruler.width + modifier);
						},
						shrink: function() {
							_this.elements.ruler.setLeft(_this.elements.ruler.left + modifier);
							_this.elements.ruler.setWidth(_this.elements.ruler.width - modifier);
						}
					}
				};

				// keycoed map for actions
				var keyMap = {
					'38':	'up',
					'40':	'down',
					'37':	'left',
					'39':	'right'
				};

				// if action exists for pressed key
				if (keyMap.hasOwnProperty(String(e.keyCode))) {

					// intercept any other actions for this combination
					e.preventDefault();

					// get the key actions
					var key = keyMap[e.keyCode];

					// run the action
					actions[key][action]();

				}

			}

		});

		// set active state
		this.active = true;

	},

	/**
	 * Ruler disable code
	 * Removes the addon and cleans up
	 */
	disable: function() {

		// shift page back up
		this.elements.toolbar.unshiftPage();

		// unregister all listeners
		this.El.removeListeners();

		// remove all elements
		this.El.removeElements();

		// remove all page resize callbacks
		this.Dimensions.removeUpdateCallbacks();

		// clean up objects
		this.elements.toolbar = null;
		this.elements.mask = null;
		this.elements.ruler = null;

		// remove active state
		this.active = false;

	},

	/**
	 * Convenience method for creating a class
	 * @param  {Function} constructor	The constructor function
	 * @param  {Object} prototype		The object prototype
	 * @return {Function}				The created class
	 */
	cls:	function(constructor, prototype) {

		constructor.prototype = prototype;
		return constructor;

	}

};