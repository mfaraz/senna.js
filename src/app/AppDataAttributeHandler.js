'use strict';

import globals from '../globals/globals';
import core from 'bower:metal/src/core';
import object from 'bower:metal/src/object/object';
import App from './App';
import HtmlScreen from '../screen/HtmlScreen';
import Route from '../route/Route';
import Disposable from 'bower:metal/src/disposable/Disposable';

const scannableDataAttributes = {
	basePath: 'data-senna-base-path',
	linkSelector: 'data-senna-link-selector',
	loadingCssClass: 'data-senna-loading-css-class',
	senna: 'data-senna',
	surface: 'data-senna-surface',
	updateScrollPosition: 'data-senna-update-scroll-position'
};

class AppDataAttributeHandler extends Disposable {

	/**
	 * Initilizes App, register surfaces and routes from data attributes.
	 * @constructor
	 */
	constructor() {
		super();

		/**
		 * Holds the app reference initialized by data attributes.
		 * @type {App}
		 * @default null
		 */
		this.app = null;

		/**
		 * Holds the base element to search initialization data attributes. This
		 * element is the container used to enable initialization based on the
		 * presence of `data-senna` attribute.
		 * @type {Element}
		 * @default null
		 */
		this.baseElement = null;
	}

	/**
	 * Inits application based on information scanned from document.
	 */
	handle() {
		if (!core.isElement(this.baseElement)) {
			throw new Error('Senna data attribute handler base element ' +
				'not set or invalid, try setting a valid element that ' +
				'contains a `data-senna` attribute.');
		}

		if (!this.baseElement.hasAttribute(scannableDataAttributes.senna)) {
			console.log('Senna was not initialized from data attributes. ' +
				'In order to enable its usage from data attributes try setting ' +
				'in the base element, e.g. `<body data-senna>`.');
			return;
		}

		if (this.app) {
			throw new Error('Senna app was already initialized.');
		}

		console.log('Senna initialized from data attribute.');

		this.app = new App();
		this.maybeAddRoutes_();
		this.maybeAddSurfaces_();
		this.maybeSetBasePath_();
		this.maybeSetLinkSelector_();
		this.maybeSetLoadingCssClass_();
		this.maybeSetUpdateScrollPosition_();
	}

	/**
	 * Disposes of this instance's object references.
	 * @override
	 */
	disposeInternal() {
		if (this.app) {
			this.app.dispose();
		}
	}

	/**
	 * Gets the app reference.
	 * @return {App}
	 */
	getApp() {
		return this.app;
	}

	/**
	 * Gets the base element.
	 * @return {Element} baseElement
	 */
	getBaseElement() {
		return this.baseElement;
	}

	/**
	 * Maybe adds app routes from link elements that are `senna-route`.
	 */
	maybeAddRoutes_() {
		var routesSelector = 'link[rel="senna-route"]';
		this.querySelectorAllAsArray_(routesSelector).forEach((link) => this.maybeParseLinkRoute_(link));
		if (!this.app.hasRoutes()) {
			this.app.addRoutes(new Route(/.*/, HtmlScreen));
			console.log('Senna can\'t find route elements, adding default.');
		}
	}

	/**
	 * Maybe adds app surfaces by scanning `data-senna-surface` data attribute.
	 */
	maybeAddSurfaces_() {
		var surfacesSelector = '[' + scannableDataAttributes.surface + ']';
		this.querySelectorAllAsArray_(surfacesSelector).forEach((surface) => this.app.addSurfaces(surface.id));
	}

	/**
	 * Adds app route by parsing valid link elements. A valid link element is of
	 * the kind `rel="senna-route"`.
	 * @param {Element} link
	 */
	maybeParseLinkRoute_(link) {
		var route = new Route(this.maybeParseLinkRoutePath_(link), this.maybeParseLinkRouteHandler_(link));
		this.app.addRoutes(route);
		console.log('Senna scanned route ' + route.getPath());
	}

	/**
	 * Maybe parse link route handler.
	 * @param {Element} link
	 * @return {?string}
	 */
	maybeParseLinkRouteHandler_(link) {
		var handler = link.getAttribute('type');
		if (core.isDefAndNotNull(handler)) {
			handler = object.getObjectByName(handler);
		}
		return handler;
	}

	/**
	 * Maybe parse link route path.
	 * @param {Element} link
	 * @return {?string}
	 */
	maybeParseLinkRoutePath_(link) {
		var path = link.getAttribute('href');
		if (core.isDefAndNotNull(path)) {
			if (path.indexOf('regex:') === 0) {
				path = new RegExp(path.substring(6));
			}
		}
		return path;
	}

	/**
	 * Maybe sets app base path from `data-senna-base-path` data attribute.
	 */
	maybeSetBasePath_() {
		var basePath = this.baseElement.getAttribute(scannableDataAttributes.basePath);
		if (core.isDefAndNotNull(basePath)) {
			this.app.setBasePath(basePath);
			console.log('Senna scanned base path ' + basePath);
		}
	}

	/**
	 * Maybe sets app link selector from `data-senna-link-selector` data
	 * attribute.
	 */
	maybeSetLinkSelector_() {
		var linkSelector = this.baseElement.getAttribute(scannableDataAttributes.linkSelector);
		if (core.isDefAndNotNull(linkSelector)) {
			this.app.setLinkSelector(linkSelector);
			console.log('Senna scanned link selector ' + linkSelector);
		}
	}

	/**
	 * Maybe sets app link loading css class from `data-senna-loading-css-class`
	 * data attribute.
	 */
	maybeSetLoadingCssClass_() {
		var loadingCssClass = this.baseElement.getAttribute(scannableDataAttributes.loadingCssClass);
		if (core.isDefAndNotNull(loadingCssClass)) {
			this.app.setLoadingCssClass(loadingCssClass);
			console.log('Senna scanned loading css class ' + loadingCssClass);
		}
	}

	/**
	 * Maybe sets app update scroll position from
	 * `data-senna-update-scroll-position` data attribute.
	 */
	maybeSetUpdateScrollPosition_() {
		var updateScrollPosition = this.baseElement.getAttribute(scannableDataAttributes.updateScrollPosition);
		if (core.isDefAndNotNull(updateScrollPosition)) {
			if (updateScrollPosition === 'false') {
				this.app.setUpdateScrollPosition(false);
			} else {
				this.app.setUpdateScrollPosition(true);
			}
			console.log('Senna scanned update scroll position ' + updateScrollPosition);
		}
	}

	/**
	 * Queries elements from document and returns an array of elements.
	 * @param {!string} selector
	 * @return {array.<Element>}
	 */
	querySelectorAllAsArray_(selector) {
		return Array.prototype.slice.call(globals.document.querySelectorAll(selector));
	}

	/**
	 * Sets the base element.
	 * @param {Element} baseElement
	 */
	setBaseElement(baseElement) {
		this.baseElement = baseElement;
	}

}

export default AppDataAttributeHandler;