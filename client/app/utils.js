isa = {};

isa.utils = {

	getIconClassForFile : function(fileName) {
		//returns the classes for an icon to show next to a filename

		var ext = fileName.substring(fileName.lastIndexOf('.')+1).toLowerCase();

		switch (ext) {
			case 'pdf':
				return 'fa fa-file-pdf-o';
			case 'doc': case 'docx':
				return 'fa fa-file-word-o';
			case 'ppt': case 'pptx':
				return 'fa fa-file-powerpoint-o';
			case 'xls': case 'xlsx':
				return 'fa fa-file-excel-o';
			case 'jpg': case 'jpeg':
				return 'fa fa-file-picture-o';
			default:
				return 'fa fa-file-text-o';
		}

	},

	/**
	 * Computes the index of a needle, or the index of the first element
	 * that satisfies the matcher.
	 *
	 * @param	haystack	Array
	 * @param	needle		Multiple
	 * @param	matcher		Function
	 * @return 	Number		Index if successful, -1 if not found.
	 */
	indexOf: function(haystack, needle, matcher) {
		var result = -1;
		if (angular.isFunction(matcher)) {
			angular.forEach(haystack, function(elm, index) {
				if (matcher(elm)) {
					result = index;
					return;
				}
			});
		} else {
			return haystack.indexOf(needle);
		}
		return result;
	},

	/**
	 * Does a given array contain an element?
	 *
	 * @param	haystack	Array
	 * @param	needle		Multiple
	 * @param	matcher		Function
	 * @return 	Boolean
	 */
	contains: function(haystack, needle, matcher) {
		return !!~this.indexOf(haystack, needle, matcher);
	},

	/**
	 * Replaces an element in an array with a given value
	 *
	 * @param	haystack		Array
	 * @param	needle			Multiple
	 * @param	replacement		Multiple
	 * @param	matcher			Function
	 */
	replace: function(haystack, needle, replacement, matcher) {
		var index = this.indexOf(haystack, needle, matcher);
		if (!!~index) {
			haystack[index] = replacement;
		}
	},

	/**
	 * Convenient function that replaces an object in an array with
	 * another object by matching against its `id` property.
	 *
	 * @param	haystack		Array
	 * @param	replacement		Object
	 */
	replaceEntity: function(haystack, replacement) {
		this.replace(haystack, null, replacement, function(prop) {
			return prop.id === replacement.id;
		});
	},

	htmlCleanup : function( htmlIn ) {
		//cleans up (pasted) HTML code from (for instance) MS Word:
		//removing all font/ changed size information

		var NOT_ALLOWED = ["FONT", "TITLE", "SPAN"];

		//setup a HTML element and inject the html
		var div = document.createElement("div");
    	div.innerHTML = htmlIn;

    	//remove all disallowed tags
    	var tags = Array.prototype.slice.apply(div.getElementsByTagName("*"), [0]);

	    for (var i = 0; i < tags.length; i++) {
	    	if ( NOT_ALLOWED.indexOf(tags[i].nodeName) > -1) {
	    		this.removeNode(tags[i]);
	    	}
    	}

    	return div.innerHTML;
	},

	removeNode : function(tag) {
		//removes a node form a DOM object, attaching all childs to its parent
		var last = tag;
	    for (var i = tag.childNodes.length - 1; i >= 0; i--) {
	        var e = tag.removeChild(tag.childNodes[i]);
	        tag.parentNode.insertBefore(e, last);
	        last = e;
	    }
	    tag.parentNode.removeChild(tag);
	},

	regexIso8601 : /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/,

	/*
	 * Searches a JSON object for ISO8601 formatted date strings and converts them to JS Date objects
	 * @author Mark Leusink
	 */
	isoDateStringsToDates : function(inObject) {

	    if (typeof inObject !== "object") return inObject;

	    for (var key in inObject) {

	        if (!inObject.hasOwnProperty(key)) { continue; }

	        var val = inObject[key];
	        var iso8601;

	        //check for iso8601 dates
	        if (typeof val === "string" && (iso8601 = val.match(this.regexIso8601))) {

	        	var ms = Date.parse(iso8601[0]);
	            if (!isNaN(ms)) {
	                inObject[key] = new Date(ms);
	            }
	        } else if (typeof val === "object") {

	        	//recursive call to deal with nested objects
	            this.isoDateStringsToDates(val);
	        }

	    }
	}

};

/*
 * removes duplicates from an array
 *
 * @author Mark Leusink
 */
Array.prototype.makeArrayUnique = function() {
	'use strict';

	var temp = {};
    for (var i = 0; i < this.length; i++) {
        temp[this[i]] = true;
    }

    var res = [];
    for (var en in temp) {
        res.push(en);
    }
    return res;

};
