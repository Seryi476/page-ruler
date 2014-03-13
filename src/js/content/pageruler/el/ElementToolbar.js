
/**
* Toolbar element
*/

(function(pr) {

pr.el.ElementToolbar = pr.cls(

	/**
	 * Constructor
	 */
	function(toolbar) {

		var _this = this;

		// set toolbar reference
		this.toolbar = toolbar;

		// create dom element
		this.dom = pr.El.createEl(
			'div',
			{
				'id':	'element-toolbar'
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

		// generate containers
		this.els.helpContainer			= this.generateHelpContainer();
		this.els.elementContainer		= this.generateElementContainer();
		this.els.navigationContainer	= this.generateNavigationContainer();
		var trackingModeContainer		= this.generateTrackingModeContainer();

		// add containers to dom
		pr.El.appendEl(this.dom, [
			this.els.helpContainer,
			this.els.elementContainer,
			this.els.navigationContainer,
			trackingModeContainer
		]);

		// mousedown listener on document - stops tracking mode
		pr.El.registerListener(document, 'click', function(e) {

			e.preventDefault();
			e.stopPropagation();

			// if in element tracking mode or html (scroll bars) are not mousedowned
			if (_this.tracking && e.target.tagName.toLowerCase() !== 'html') {

				// disable tracking
				_this.setTracking(false, true);

				// track usage
				chrome.runtime.sendMessage(
					{
						action:	'trackEvent',
						args:	['Action', 'Element Mode Click']
					}
				)

			}

		});

	},

	{

		/**
		 * Element toolbar dom object
		 */
		dom: null,

		/**
		 * Element references
		 */
		els:	{
			helpContainer:			null,
			elementContainer:		null,
			element:				null,
			upContainer:			null,
			up:						null,
			downContainer:			null,
			down:					null,
			previousContainer:		null,
			previous:				null,
			nextContainer:			null,
			next:					null,
			navigationContainer:	null,
			trackingContainer:		null,
			trackingInput:			null
		},

		/**
		 * Height of the element toolbar
		 * @type {number}
		 */
		height:	30,

		/**
		 * Reference to toolbar
		 * @type {PageRuler.el.Toolbar}
		 */
		toolbar: null,

		/**
		 * Whether tracking mode is on
		 * @type {boolean}
		 */
		tracking:	false,

		/**
		 * The currently highlighted element
		 * @type {PageRuler.el.Element}
		 */
		element:	null,

		/**
		 * Shows the element toolbar
		 */
		show: function() {

			// set display
			this.dom.style.setProperty('display', 'flex', 'important');

			// calculate the height of the toolbar
			var height = this.height+this.toolbar.height;

			// set toolbar height so the element toolbar fits
			this.toolbar.dom.style.setProperty('height', pr.Util.px(height), 'important');

			// shift the page down some more so the toolbar doesn't overlap content
			this.toolbar.shiftPage(height);

			// turn on tracking mode by default
			this.setTracking(true, true);

			// track usage
			chrome.runtime.sendMessage(
				{
					action:	'trackEvent',
					args:	['Action', 'Element Toolbar', 'Show']
				}
			)

		},

		/**
		 * Hides the element toolbar
		 */
		hide: function() {

			// reset display for element toolbar
			this.dom.style.removeProperty('display');

			// reset height for main toolbar
			this.toolbar.dom.style.removeProperty('height');

			// reshift page
			this.toolbar.shiftPage(this.toolbar.height);

			// disable tracking mode
			this.setTracking(false, true);

			// reset highlighted element
			this.element = null;

			// reset display for the containers
			this.els.helpContainer.style.removeProperty('display');
			this.els.elementContainer.style.setProperty('display', 'none', 'important');
			this.els.navigationContainer.style.setProperty('display', 'none', 'important');

			// track usage
			chrome.runtime.sendMessage(
				{
					action:	'trackEvent',
					args:	['Action', 'Element Toolbar', 'Hide']
				}
			)

		},

		/**
		 * Generates the help container
		 * @returns {HTMLElement}
		 */
		generateHelpContainer: function() {

			var container = pr.El.createEl('div', {
				'id':		'element-toolbar-help-container',
				'cls':		['help-container', 'container']
			}, {}, pr.Util.locale('elementToolbarHelp'));

			return container;

		},

		/**
		 * Generates a tag container
		 * @param {string} id	The id to use for elements in the tag container
		 * @returns {HTMLElement}
		 */
		generateTagContainer: function(id) {

			// create container
			var container = pr.El.createEl('div', {
				'id':	'element-toolbar-' + id
			});

			// create tag span
			var elementTag = pr.El.createEl('span', {
				'id':	'element-toolbar-' + id + '-tag',
				'cls':	'tag'
			});

			// create id span
			var elementId = pr.El.createEl('span', {
				'id':	'element-toolbar-' + id + '-id',
				'cls':	'id'
			});

			// create class span
			var elementCls = pr.El.createEl('span', {
				'id':	'element-toolbar-' + id + '-cls',
				'cls':	'cls'
			});

			// add spans to container
			pr.El.appendEl(container, [
				elementTag,
				elementId,
				elementCls
			]);

			return container;

		},

		/**
		 * Generates the element container where details of the highlighted element go
		 * @returns {HTMLElement}
		 */
		generateElementContainer: function() {

			var _this = this;

			// create container
			var container = pr.El.createEl(
				'div',
				{
					'id':		'element-toolbar-element-container',
					'cls':		['container', 'nav-container'],
					'style':	'display:none !important;'
				},
				{
					'click': function(e) {

						// highlight the element when we click the container
						_this.setElement(_this.element.dom);

						// track usage
						chrome.runtime.sendMessage(
							{
								action:	'trackEvent',
								args:	['Action', 'Element Click', 'Element']
							}
						);

					}
				}
			);

			// create contents
			this.els.element = this.generateTagContainer('element');

			// add contents to container
			pr.El.appendEl(container, [
				this.els.element
			]);

			return container;

		},

		/**
		 * Generates the navigation container
		 * @returns {HTMLElement}
		 */
		generateNavigationContainer: function() {

			var _this = this;

			// create container
			var container = pr.El.createEl('div', {
				'id':		'element-toolbar-navigate-container',
				'cls':		'container',
				'style':	'display:none !important;'
			});

			/*
			 * Up (parent node) container
			 */

			// create container
			this.els.upContainer = pr.El.createEl(
				'div',
				{
					'id':	'element-toolbar-navigate-up-container',
					'cls':	'nav-container'
				},
				{
					'click': function(e) {

						// highlight the parent node when container is clicked
						_this.setElement(pr.El.getParentNode(_this.element.dom));

						// track usage
						chrome.runtime.sendMessage(
							{
								action:	'trackEvent',
								args:	['Action', 'Element Click', 'Parent']
							}
						);

					}
				}
			);


			// create up arrow image
			var upImg = pr.El.createEl('img', {
				'id':	'element-toolbar-navigate-up-img',
				'src':	chrome.extension.getURL("images/arrow-up.png")
			});

			// create tag container
			this.els.up = this.generateTagContainer('up');

			// add contents to container
			pr.El.appendEl(this.els.upContainer, [
				upImg,
				this.els.up
			]);

			/*
			 * Down
			 */

			// create container
			this.els.downContainer = pr.El.createEl(
				'div',
				{
					'id':	'element-toolbar-navigate-down-container',
					'cls':	'nav-container'
				},
				{
					'click': function(e) {

						// highlight the child node when container is clicked
						_this.setElement(pr.El.getChildNode(_this.element.dom));

						// track usage
						chrome.runtime.sendMessage(
							{
								action:	'trackEvent',
								args:	['Action', 'Element Click', 'Child']
							}
						);

					}
				}
			);

			// create down arrow image
			var downImg = pr.El.createEl('img', {
				'id':	'element-toolbar-navigate-down-img',
				'src':	chrome.extension.getURL("images/arrow-down.png")
			});

			// create tag container
			this.els.down = this.generateTagContainer('down');

			// add contents to container
			pr.El.appendEl(this.els.downContainer, [
				downImg,
				this.els.down
			]);

			/*
			 * Previous sibling
			 */

			// create container
			this.els.previousContainer = pr.El.createEl(
				'div',
				{
					'id':	'element-toolbar-navigate-previous-container',
					'cls':	'nav-container'
				},
				{
					'click': function(e) {

						// highlight the previous sibling node when container is clicked
						_this.setElement(pr.El.getPreviousSibling(_this.element.dom));

						// track usage
						chrome.runtime.sendMessage(
							{
								action:	'trackEvent',
								args:	['Action', 'Element Click', 'Previous']
							}
						);

					}
				}
			);

			// create left arrow image
			var previousImg = pr.El.createEl('img', {
				'id':	'element-toolbar-navigate-previous-img',
				'src':	chrome.extension.getURL("images/arrow-left.png")
			});

			// create tag container
			this.els.previous = this.generateTagContainer('previous');

			// add contents to container
			pr.El.appendEl(this.els.previousContainer, [
				previousImg,
				this.els.previous
			]);

			/*
			 * Next sibling
			 */

			// create container
			this.els.nextContainer = pr.El.createEl(
				'div',
				{
					'id':	'element-toolbar-navigate-next-container',
					'cls':	'nav-container'
				},
				{
					'click': function(e) {

						// highlight the next sibling node when container is clicked
						_this.setElement(pr.El.getNextSibling(_this.element.dom));

						// track usage
						chrome.runtime.sendMessage(
							{
								action:	'trackEvent',
								args:	['Action', 'Element Click', 'Next']
							}
						);

					}
				}
			);

			// create right arrow image
			var nextImg = pr.El.createEl('img', {
				'id':	'element-toolbar-navigate-next-img',
				'src':	chrome.extension.getURL("images/arrow-right.png")
			});

			// create tag container
			this.els.next = this.generateTagContainer('next');

			// add contents
			pr.El.appendEl(this.els.nextContainer, [
				nextImg,
				this.els.next
			]);

			// add all navigation containers to the main container
			pr.El.appendEl(container, [
				this.els.upContainer,
				this.els.downContainer,
				this.els.previousContainer,
				this.els.nextContainer
			]);

			return container;

		},

		/**
		 * Generate the tracking mode container
		 * @returns {HTMLElement}
		 */
		generateTrackingModeContainer: function() {

			var _this = this;

			// create container
			this.els.trackingContainer = pr.El.createEl('div', {
				'id':	'element-toolbar-tracking-mode-container',
				'cls':	'container'
			});

			// create label
			var label = pr.El.createEl('label', {
				'id':	'element-toolbar-tracking-mode-label',
				'for':	'element-toolbar-tracking-mode-input'
			}, {}, pr.Util.locale('elementToolbarTrackingMode'));

			var lang = (navigator.language || '').split('-')[0];
			if (!!lang) {
				lang = 'lang_' + lang;
			}

			// create toggle element
			var toggle = pr.El.createEl('div', {
				'id':	'element-toolbar-tracking-mode-toggle',
				'cls':	'checkbox-toggle ' + lang
			});

			// create checkbox element
			var input = pr.El.createEl('input', {
				'id':		'element-toolbar-tracking-mode-input',
				'type':		'checkbox',
				'checked':	true
			}, {
				'change': function(e) {

					// change tracking mode
					_this.setTracking(this.checked, false);

					// track usage
					chrome.runtime.sendMessage(
						{
							action:	'trackEvent',
							args:	['Action', 'Tracking Mode Element', this.checked && 'On' || 'Off']
						}
					);

				}
			});

			// set reference to checkbox
			this.els.trackingInput = input;

			// create toggle label
			var toggleLabel = pr.El.createEl('label', {
				'id':	'element-toolbar-tracking-mode-toggle-label',
				'for':	'element-toolbar-tracking-mode-input'
			});

			// create label inner
			var labelInner = pr.El.createEl('div', {
				'id':		'element-toolbar-tracking-mode-label-inner',
				'class':	'inner'
			});

			// create label switch
			var labelSwitch = pr.El.createEl('div', {
				'id':		'element-toolbar-tracking-mode-label-switch',
				'class':	'switch ' + lang
			});

			// add label contents
			pr.El.appendEl(toggleLabel, [
				labelInner,
				labelSwitch
			]);

			// add toggle contents
			pr.El.appendEl(toggle, [
				input,
				toggleLabel
			]);

			// add container contents
			pr.El.appendEl(this.els.trackingContainer, [
				label,
				toggle
			]);

			return this.els.trackingContainer;

		},

		/**
		 * Sets the tracking mode and optionally changes the checkbox
		 *
		 * @param {boolean} tracking	Whether to enable or disable tracking
		 * @param {booleab} toggleInput	Whether to also update the checkbox
		 */
		setTracking: function(tracking, toggleInput) {

			// set tracking state
			this.tracking = tracking;

			// tracking enabled
			if (!!tracking) {

				// add tracking class to ruler
				this.toolbar.ruler.ruler.classList.add('tracking');
			}
			// tracking disabled
			else {

				// remove tracking class from ruler
				this.toolbar.ruler.ruler.classList.remove('tracking');
			}

			// track usage
			chrome.runtime.sendMessage(
				{
					action:	'trackEvent',
					args:	['Action', 'Tracking Mode', tracking && 'On' || 'Off']
				}
			)

			// if also changing checkbox
			if (!!toggleInput) {

				// update checkbox
				this.els.trackingInput.checked = tracking;

			}

		},

		/**
		 * Sets the description for an element
		 *
		 * @param {HTMLElement} container	The tag container
		 * @param {HTMLELement} element		The element to describe
		 * @param {string} title			The title to append to the tooltip
		 */
		setElementDescription: function(container, element, title) {

			try {

				// generate description
				var descParts	= pr.El.getDescription(element, true);

				// set tag, id and class parts
				container.querySelector('.page-ruler-tag').innerText	= descParts.tag;
				container.querySelector('.page-ruler-id').innerText	= descParts.id;
				container.querySelector('.page-ruler-cls').innerText	= descParts.cls;

				// update title
				container.title = title + ': ' + descParts.tag + descParts.id + descParts.cls;

			}
			catch (e) {}

		},

		/**
		 * Shows or hides a specific navigation container and populates it with an element description
		 *
		 * @param {string} direction	The direction to get the navigation element
		 * @param {HTMLElement} target	The element to get the navidation element from
		 */
		setNavigation: function(direction, target) {

			// set container, element and title depending on the direction
			var element, container, title;
			switch (direction) {
				case 'up':
					container	= this.els.upContainer;
					element		= pr.El.getParentNode(target);
					title		= pr.Util.locale('elementToolbarParentNode');
				break;
				case 'down':
					container	= this.els.downContainer;
					element		= pr.El.getChildNode(target);
					title		= pr.Util.locale('elementToolbarChildNode');
				break;
				case 'previous':
					container	= this.els.previousContainer;
					element		= pr.El.getPreviousSibling(target);
					title		= pr.Util.locale('elementToolbarPreviousSibling');
					break;
				case 'next':
					container	= this.els.nextContainer;
					element		= pr.El.getNextSibling(target);
					title		= pr.Util.locale('elementToolbarNextSibling');
				break;
			}

			// if element exists
			// and is not the document root
			// and is not an extension element
			if (
				!!element
				&& element !== document.documentElement
				&& !(element.id && element.id.match(/^page\-ruler/))
			) {

				// show it
				container.style.removeProperty('display');

				// set the description
				this.setElementDescription(container, element, title);

			}
			// otherwise hide it
			else {

				container.style.setProperty('display', 'none', 'important');

			}

		},

		/**
		 * Sets the currently highlighted element
		 * @param {HTMLElement} target
		 */
		setElement: function(target) {

			// if not element has yet been set
			if (this.element === null) {

				// hide the help container
				this.els.helpContainer.style.setProperty('display', 'none', 'important');

				// show the element and navigation containers
				this.els.elementContainer.style.removeProperty('display');
				this.els.navigationContainer.style.removeProperty('display');

			}

			// set the element
			this.element = new pr.el.Element(target);

			// update the highlighted element description
			this.setElementDescription(this.els.element, this.element.dom, pr.Util.locale('elementToolbarHighlightedElement'));

			// update the navigation elements
			this.setNavigation('up', target);
			this.setNavigation('down', target);
			this.setNavigation('previous', target);
			this.setNavigation('next', target);

			// update guides
			pr.elements.guides.setSizes();

		}

	}

);

})(__PageRuler);