// strict mode
"use strict";

var PageRuler = {

	/**
	 * Addon initialisation
	 */
	init:		function(type, previousVersion) {

		console.log('init');

		var manifest	= chrome.runtime.getManifest();
		var version		= manifest.version;

		switch (type) {

			// First time install
			case 'install':

				console.log('First time install version: ', version);

				PageRuler.Analytics.trackEvent('Run', 'Install', version);

				// store initial version and default settings
				chrome.storage.sync.set({
					'statistics':		true,
					'hide_update_tab':	false
				});

				break;

			// extension update
			case 'update':

				console.log('Update version. From: ', previousVersion, ' To: ', version);

				PageRuler.Analytics.trackEvent('Run', 'Update', version);

				break;

			// anything else
			default:

				console.log('Existing version run: ', version);

				PageRuler.Analytics.trackEvent('Run', 'Open', version);

				break;

		}

	},

	/**
	 * Returns an image object containing all relevant sizes
	 *
	 * @param {String} file
	 * @returns {{19: string, 38: string}}
	 */
	image:		function(file) {

		return {
			"19":	"images/19/" + file,
			"38":	"images/38/" + file
		};

	},

	/**
	 * Loads the addon content script into the current tab and then enables it
	 *
	 * @param {number} tabId	The tab id to load the addon into
	 */
	load:		function(tabId) {

		console.log('loading content script');

		// load the script
		chrome.tabs.executeScript(
			tabId,
			{
				file:	"content.js"
			},
			function() {

				console.log('content script for tab #' + tabId + ' has loaded');

				// save the tab loaded state and then load the addon
				PageRuler.enable(tabId);
			}
		);

	},

	/**
	 * Enables the addon for the tab
	 *
	 * @param {number} tabId	The tab id
	 */
	enable: function(tabId) {

		// send message to the tab telling it to activate
		chrome.tabs.sendMessage(
			tabId,
			{
				type: 'enable'
			},
			function(success) {

				console.log('enable message for tab #' + tabId + ' was sent');

				// log event
				PageRuler.Analytics.trackEvent('Action', 'Enable');

				// update browser action icon to active state
				chrome.browserAction.setIcon({
					"path":		PageRuler.image("browser_action_on.png"),
					"tabId":	tabId
				});
			}
		);

	},

	/**
	 * Disables the addon for the tab
	 *
	 * @param {number} tabId	The tab id
	 */
	disable: function(tabId) {

		// send message to the tab telling it to activate
		chrome.tabs.sendMessage(
			tabId,
			{
				type: 'disable'
			},
			function(success) {

				console.log('disable message for tab #' + tabId + ' was sent');

				// log event
				PageRuler.Analytics.trackEvent('Action', 'Disable');

				// update browser action icon to active state
				chrome.browserAction.setIcon({
					"path":		PageRuler.image("browser_action.png"),
					"tabId":	tabId
				});
			}
		);

	},

	/**
	 * Runs the browserAction
	 *
	 * @param tab
	 */
	browserAction:	function(tab) {

		// get the current tab id
		var tabId = tab.id;

		// construct arguments to send to the tab
		var args = "'action': 'loadtest'," +
					"'loaded': window.hasOwnProperty('__PageRuler')," +
					"'active': window.hasOwnProperty('__PageRuler') && window.__PageRuler.active";

		// get the tab to send a message back to the background script telling it of the addon state
		chrome.tabs.executeScript(tabId, {
			code:	"chrome.runtime.sendMessage({ " + args + " });"
		});

	},

	/**
	 * Opens the update page
	 */
	openUpdateTab: function(type) {

		// only show update tab if the user hasn't disabled it
		chrome.storage.sync.get('hide_update_tab', function(items) {

			if (!items.hide_update_tab) {

				chrome.tabs.create({
					url: 'update.html#' + type
				});

			}

		});

	},

	/**
	 * Sets the error popup for the page if required
	 *
	 * @param tabId
	 * @param changeInfo
	 * @param tab
	 */
    setPopup: function(tabId, changeInfo, tab) {

		// get tab url
        var url = changeInfo.url || tab.url || false;

		// if url exists
        if (!!url) {

			// local chrome-extension:// and chrome:// pages
            if (/^chrome\-extension:\/\//.test(url) || /^chrome:\/\//.test(url)) {
                chrome.browserAction.setPopup({
                    tabId:  tabId,
                    popup:  'popup.html#local'
                });
            }

			// chrome webstore
            if (/^https:\/\/chrome\.google\.com\/webstore\//.test(url)) {
                chrome.browserAction.setPopup({
                    tabId:  tabId,
                    popup:  'popup.html#webstore'
                });
            }

        }

    }

};

/**
 * Listeners
 */

// browser action
chrome.browserAction.onClicked.addListener(PageRuler.browserAction);

// tab load
chrome.tabs.onUpdated.addListener(PageRuler.setPopup);

// startup
chrome.runtime.onStartup.addListener(function() {
	console.log('onStartup');
	PageRuler.init();
});

// installation
chrome.runtime.onInstalled.addListener(function(details) {

	console.log('onInstalled');
	PageRuler.init(details.reason, details.previousVersion);

	switch (details.reason) {
		case 'install':
			PageRuler.openUpdateTab('install');
			break;
		case 'update':
			PageRuler.openUpdateTab('update');
			break;
	}
});

/*
 * Messages
 */
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {

	// get tab id
	var tabId = sender.tab && sender.tab.id;

	console.group('message received from tab #' + tabId)
	console.log('message: ', message);
	console.log('sender: ', sender);

	switch (message.action) {

		// check whether the addon content script is loaded and it's active state
		case 'loadtest':

			// content script not yet loaded
			if (!message.loaded) {

				// load it
				PageRuler.load(tabId);

			}
			// content script is loaded
			else {

				// addon is active
				if (message.active) {

					// disable it
					PageRuler.disable(tabId);

				}
				// addon is inactive
				else {

					// enable it
					PageRuler.enable(tabId);

				}

			}

		break;

		// disable addon for the tab
		case 'disable':

			console.log('tear down');

			if (!!tabId) {
				PageRuler.disable(tabId);
			}

		break;

		// sets the ruler colour
		case 'setColor':

			console.log('saving color ' + message.color);

			PageRuler.Analytics.trackEvent('Settings', 'Color', message.color);

			chrome.storage.sync.set({
				'color':	message.color
			});

		break;

		// get the ruler colour
		case 'getColor':

			console.log('requesting color');

			chrome.storage.sync.get('color', function(items) {

				// get colour or default to blue
				var color = items.color || '#0080ff';

				console.log('color requested: ' + color);

				sendResponse(color);

			});

		break;

		// sets the dock position of the toolbar
		case 'setDockPosition':

			console.log('saving dock position ' + message.position);

			PageRuler.Analytics.trackEvent('Settings', 'Dock', message.position);

			chrome.storage.sync.set({
				'dock':	message.position
			});

		break;

		// get the toolbar dock position
		case 'getDockPosition':

			console.log('requesting dock position');

			chrome.storage.sync.get('dock', function(items) {

				// get colour or default to top
				var position = items.dock || 'top';

				console.log('dock position requested: ' + position);

				sendResponse(position);

			});

			break;

		// sets whether guides are visible
		case 'setGuides':

			console.log('saving guides visiblity ' + message.visible);

			PageRuler.Analytics.trackEvent('Settings', 'Guides', message.visible && 'On' || 'Off');

			chrome.storage.sync.set({
				'guides':	message.visible
			});

			break;

		// gets the guides are visibility
		case 'getGuides':

			console.log('requesting guides visibility');

			chrome.storage.sync.get('guides', function(items) {

				// get colour or default to top
				var visiblity = items.hasOwnProperty('guides') ? items.guides : true;

				console.log('guides visibility requested: ' + visiblity);

				sendResponse(visiblity);

			});

			break;

		// track an event
		case 'trackEvent':

			console.log('track event message received: ', message.args);

			PageRuler.Analytics.trackEvent.apply(PageRuler.Analytics, message.args);

			sendResponse();

		break;

		// track a pageview
		case 'trackPageview':

			console.log('track pageview message received: ', message.page);

			PageRuler.Analytics.trackPageview(message.page);

			sendResponse();

		break;

		// open help page
		case 'openHelp':

			PageRuler.Analytics.trackEvent(['Action', 'Help Link']);

			chrome.tabs.create({
				url: chrome.extension.getURL('update.html') + '#help'
			});

		break;

	}

	console.groupEnd();

	return true;

});

/*
 * Commands
 */
chrome.commands.onCommand.addListener(function(command) {
	console.log('Command:', command);
});