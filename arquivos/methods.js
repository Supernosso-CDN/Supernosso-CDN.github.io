// log-css.js v1.1
const log = console.log.bind();
const css = function(item, color = '#fff', background = 'none', fontSize = '12px', fontWeight = 700, fontFamily) {
	return ['%c' + item, 'color:' + color + ';background:' + background + ';font-size:' + fontSize + ';font-weight:' + fontWeight + (fontFamily ? ';font-family:' + fontFamily : '')];
};

// on-attr-changed.js v1, based on https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
function onAttrChanged(elements, attrs, callback, firstRun) { // support jquery too
	if (typeof(elements) === 'string') { // string to node list
		elements = document.querySelectorAll(elements);
		if (!elements.length) {
			return false;
		};
	};
	if (!elements.length) { // node to array
		elements = [elements];
	};
	// alias to allow: (elements, attrs, callback, firstRun) OR (elements, callback, firstRun)
	if (typeof(attrs) === 'function') {
		if (typeof(callback) === 'boolean') {
			if (firstRun === undefined) {
				firstRun = callback;
			};
		};
		callback = attrs;
		attrs = undefined;
	};
	if (typeof(attrs) === 'string') {
		attrs = attrs.trim().split(/\s+/g);
	};
	for (let i = 0; i < elements.length; i++) {
		let element = elements[i];
		let observer = new MutationObserver(function(mutationsList, observer) {
			for (let mutation of mutationsList) {
				let attribute = mutation.attributeName;
				if (attrs === undefined || attrs.indexOf(attribute) > -1) {
					let value = element.getAttribute(attribute);
					callback(attribute, value, observer, mutation, mutationsList);
				};
			};
		});
		observer.observe(element, {
			attributes: true
		});
		if (firstRun) {
			let objAttrs = listAttrsInfos(element);
			if (attrs !== undefined) {
				let objAttrsTemp = {};
				for (let i = 0; i < attrs.length; i++) {
					let attr = attrs[i];
					objAttrsTemp[attr] = objAttrs[attr] !== undefined ? objAttrs[attr] : null;
				};
				objAttrs = objAttrsTemp;
			};
			for (let attr in objAttrs) {
				callback(attr, objAttrs[attr], observer, undefined, undefined);
			};
		};
	};

	function listAttrsInfos(element) {
		let objAttrs = {};
		for (let attr of element.attributes) {
			objAttrs[attr.nodeName] = attr.nodeValue;
		};
		return objAttrs;
	};
};

// https://github.com/mboughaba/element-matches-polyfill
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.matchesSelector ||
	Element.prototype.mozMatchesSelector ||
	Element.prototype.msMatchesSelector ||
	Element.prototype.oMatchesSelector ||
	Element.prototype.webkitMatchesSelector ||
	function(s) {
		var matches = (this.parentNode || this.document || this.ownerDocument).querySelectorAll(s),
			i = matches.length;
		while (--i >= 0 && matches.item(i) !== this) {}
		return i > -1;
	};
};

// on-child-changed.js v1, dependence: _onChildChanged
function onChildChanged(elements, selector, callback, firstRun) {
	_onChildChanged('changed', elements, selector, callback, firstRun);
};

// on-child-added.js v1, dependence: _onChildChanged
function onChildAdded(elements, selector, callback, firstRun) {
	_onChildChanged('addedNodes', elements, selector, callback, firstRun);
};

// on-child-removed.js v1, dependence: _onChildChanged
function onChildRemoved(elements, selector, callback, firstRun) {
	_onChildChanged('removedNodes', elements, selector, callback, firstRun);
};

// _on-child-changed.js v1, based on https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
function _onChildChanged(type, elements, selector, callback, firstRun) { // support jquery too
	if (typeof(elements) === 'string') { // string to node list
		elements = document.querySelectorAll(elements);
		if (!elements.length) {
			return false;
		};
	};
	if (!elements.length) { // node to array
		elements = [elements];
	};
	// alias to allow: (elements, selector, callback, firstRun) OR (elements, callback, firstRun)
	if (typeof(selector) === 'function') {
		if (typeof(callback) === 'boolean') {
			if (firstRun === undefined) {
				firstRun = callback;
			};
		};
		callback = selector;
	};
	for (let i = 0; i < elements.length; i++) {
		let element = elements[i];
		let observer = new MutationObserver(function(mutationsList, observer) {
			for (let j in mutationsList) {
				let mutation = mutationsList[j];
				let addedNodes = type !== 'removedNodes' ? filterNodes(mutation.addedNodes, selector) : null;
				let removedNodes = type !== 'addedNodes' ? filterNodes(mutation.removedNodes, selector) : null;
				let target = mutation.target;
				let nodesObj = {
					addedNodes: addedNodes,
					removedNodes: removedNodes
				};
				switch (type) {
					case 'changed':
						if (addedNodes || removedNodes) {
							callback(target, nodesObj, observer);
						};
						break;
					case 'addedNodes':
						if (addedNodes) {
							callback(target, addedNodes, observer);
						};
						break;
					case 'removedNodes':
						if (removedNodes) {
							callback(target, removedNodes, observer);
						};
						break;
				};
			};
		});
		observer.observe(element, {
			childList: true
		});
		if (firstRun) {
			let addedNodes = element.querySelectorAll(selector);
			if (!addedNodes.length) {
				addedNodes = null;
			};
			let nodesObj = {
				addedNodes: addedNodes,
				removedNodes: null
			};
			switch (type) {
				case 'changed':
					if (addedNodes) {
						callback(element, nodesObj, observer);
					};
					break;
				case 'addedNodes':
					if (addedNodes) {
						callback(element, addedNodes, observer);
					};
					break;
			};
		};
	};

	function filterNodes(nodes, selector) {
		if (!nodes || !selector) {
			return nodes;
		};
		let newNodes = [];
		for (let node of nodes) {
			if (node.matches(selector)) {
				newNodes.push(node);
			};
		};
		return newNodes.length ? newNodes : null;
	};
};

// nope.js v1.0.1
function nope(){
	let _fn = function(){};
	_fn.done = function(fn){
		return fn();
	};
	return _fn;
};

// setTimesout.js v1
function setTimesout(function_ = function() {}, repeats = [0]) {
	repeats = repeats.sort(function(a, b) {
		return a - b;
	});
	for (let i = 0; i < repeats.length; i++) {
		setTimeout(function() {
			function_();
		}, repeats[i]);
	};
};

// throttle.js v1
function throttle(func, wait) {
	let wasCalled = false;
	return function() {
		if (!wasCalled) {
			func();
			wasCalled = true;
			setTimeout(function() {
				wasCalled = false;
			}, wait);
		}
	};
};