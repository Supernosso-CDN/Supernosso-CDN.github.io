// on-attr-change.js v1, based on https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
export default function onAttrChange(elements, attrs, callback, firstRun) { // support jquery too
	if (typeof(elements) === 'string') {
		elements = document.querySelectorAll(elements);
		if (elements.length === 0) {
			return false;
		};
	};
	if (!elements.length) {
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
		attrs = attrs.trim().split(/\s+/);
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