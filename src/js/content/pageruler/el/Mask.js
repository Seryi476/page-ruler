
/**
 * Mask element
 */

(function(pr) {

pr.el.Mask = pr.cls(
	function() {
			
		var _this = this;

		// create mask dom
		this.dom = pr.El.createEl('div', {
			'id':	'mask'
		});

		// set width and height to cover the entire page
		this.dom.style.setProperty('width', pr.Util.px(pr.Dimensions.pageRight), 'important');
		this.dom.style.setProperty('height', pr.Util.px(pr.Dimensions.pageBottom), 'important');

		// add the mask to the body
		pr.El.appendEl(document.body, this.dom);
		
		// resize the mask if the browser size changes
		pr.Dimensions.addUpdateCallback(function(width, height) {		
			_this.dom.style.setProperty('width', pr.Util.px(width), 'important');
			_this.dom.style.setProperty('height', pr.Util.px(height), 'important');
		});

		pr.El.registerListener(this.dom, 'mousedown', function() {
			document.activeElement.blur();
		});
		
	},
	{

		/**
		 * The dom element
		 * @type {HTMLElement}
		 */
		dom:	null
	}
);

})(__PageRuler);