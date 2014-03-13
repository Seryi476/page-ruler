/**
 * Resize element
 */

(function(pr) {

pr.el.Resize = pr.cls(

	/**
	 * Class constructor
	 * @param {PageRuler.el.Ruler} ruler	The ruler object
	 * @param {string} id					Element id
	 * @param {string} cls					Element class
	 */
	function(ruler, id, cls) {
		
		// initialise allowable directions when dragging
		var directions = {
			top:	false,
			bottom:	false,
			left:	false,
			right:	false
		};
		
		// get positions from id
		var positions = id.split('-');
		
		// set allowed directions
		for (var i=0,ilen=positions.length; i<ilen; i++) {
			directions[positions[i]] = true;
		}

		// set attributes
		var attrs = {
			'id':		'resize-' + id,
			'class':	[cls, id]
		};
		
		// create dom element
		this.dom = pr.El.createEl('div', attrs);

		// add mousedown listener - this will initialise the resizing
		pr.El.registerListener(this.dom, 'mousedown', function(e) {

			var mouseX = pr.Mouse.getX(e);
			var mouseY = pr.Mouse.getY(e);
			
			// we don't want to interact with any other elements
			e.stopPropagation();
			e.preventDefault();
				
			// set resize rules
			ruler.resizingLeft		= directions.left;
			ruler.resizingTop		= directions.top;
			ruler.resizingBottom	= directions.bottom;
			ruler.resizingRight		= directions.right;

			// set resizing offsets
			if (directions.left) {
				ruler.resizingOffsetLeft = mouseX - ruler.left;
			}

			if (directions.top) {
				ruler.resizingOffsetTop = mouseY - ruler.top;
			}

			if (directions.bottom) {
				ruler.resizingOffsetBottom = ruler.bottom - mouseY;
			}

			if (directions.right) {
				ruler.resizingOffsetRight = ruler.right - mouseX;
			}
			
			
		});
		
		// add mouseup listener - this will stop the resizing
		pr.El.registerListener(this.dom, 'mouseup', function(e) {
			
			// reset resize rules
			ruler.resizingLeft		= false;
			ruler.resizingTop		= false;
			ruler.resizingBottom	= false;
			ruler.resizingRight		= false;

			// reset resizing offsets
			ruler.resizingOffsetLeft	= 0;
			ruler.resizingOffsetTop		= 0;
			ruler.resizingOffsetBottom	= 0;
			ruler.resizingOffsetRight	= 0;
			
		});

	},
	{

		/**
		 * The dom element
		 * @type {HTMLElement}
		 */
		dom:	null,

		/**
		 * Sets the border color of the resize element
		 * @param {string} hex
		 */
		setColor: function(hex) {

			this.dom.style.setProperty('border-color', hex, 'important');

		}

	}

);

})(__PageRuler);