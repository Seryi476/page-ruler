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