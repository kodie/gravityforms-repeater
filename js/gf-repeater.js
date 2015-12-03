var gfRepeater_debug = false;
var gfRepeater_repeaters = {};
var gfRepeater_submitted = false;

/*
	gfRepeater_getRepeaters()
		Collects all repeater info and stores it inside of the global array "gfRepeater_repeaters". - First phase of setup.
*/
function gfRepeater_getRepeaters() {
	var repeaterId = 0;

	var repeaterFound = 0;
	var repeaterChildCount = 0;
	var repeaterChildren = {};
	var repeaterChildrenInputData = {};
	var repeaterChildrenPrePopulate = {};
	var dataElement;
	var startElement;
	var repeaterRequiredChildren;

	jQuery('.gfield').each(function(){
		if (repeaterFound == 0) {
			if (jQuery(this).has('.ginput_container_repeater').length) {
				// Repeater Start

				repeaterId += 1;

				if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Start: '+jQuery(this).attr('id')); }

				startElement = jQuery(this);
				dataElement = startElement.find('.gform_hidden');

				repeaterRequiredChildren = dataElement.attr('data-required');
				if (repeaterRequiredChildren) { repeaterRequiredChildren = repeaterRequiredChildren.split(','); } else { repeaterRequiredChildren = []; }

				var prePopulate = dataElement.attr('data-prepopulate');
				if (prePopulate) { repeaterChildrenPrePopulate = JSON.parse(prePopulate); }

				repeaterFound = 1;
			}
		} else {
			if (jQuery(this).has('.ginput_container_repeater').length) { return false; }
			if (jQuery(this).has('.ginput_container_repeater-end').length) {
				// Repeater End

				if (gfRepeater_debug) {
					console.log('Repeater #'+repeaterId+' - End: '+jQuery(this).attr('id'));
					console.log('Repeater #'+repeaterId+' - Children Found: '+(repeaterChildCount));
				}

				var repeaterControllers = {};
				var endElement = jQuery(this);
				var addElement = endElement.find('.gf_repeater_add');
				var removeElement = endElement.find('.gf_repeater_remove');
				var addFunction = 'gfRepeater_repeatRepeater('+repeaterId+');';
				var removeFunction = 'gfRepeater_unrepeatRepeater('+repeaterId+');';
				jQuery(addElement).attr({onclick:addFunction,onkeypress:addFunction});
				jQuery(removeElement).attr({onclick:removeFunction,onkeypress:removeFunction});
				repeaterControllers = {add:addElement,remove:removeElement,data:dataElement,start:startElement,end:endElement};

				var repeaterSettings = {};
				var repeaterStart = Number(dataElement.attr('data-start'));
				var repeaterMin = Number(dataElement.attr('data-min'));
				var repeaterMax = Number(dataElement.attr('data-max'));
				if (!repeaterStart || (repeaterMax && repeaterStart > repeaterMax)) { repeaterStart = 1; }
				if (!repeaterMin || (repeaterMax && repeaterMin > repeaterMax)) { repeaterMin = 1; }
				if (!repeaterMax || (repeaterMin && repeaterMax && repeaterMin > repeaterMax)) { repeaterMax = null; }
				repeaterSettings = {start:repeaterStart,min:repeaterMin,max:repeaterMax};

				var repeaterdata = {};
				if (gfRepeater_submitted) { var prevRepeatCount = JSON.parse(jQuery.captures(dataElement.attr('name')))['repeatCount']; } else { var prevRepeatCount = null; }
				repeaterdata = {repeatCount:1,prevRepeatCount:prevRepeatCount,childrenCount:repeaterChildCount,inputData:repeaterChildrenInputData};

				gfRepeater_repeaters[repeaterId] = {data:repeaterdata,settings:repeaterSettings,controllers:repeaterControllers,children:repeaterChildren};

				gfRepeater_updateDataElement(repeaterId);

				// Set back to defaults for the next repeater
				repeaterFound = 0;
				repeaterChildCount = 0;
				repeaterChildren = {};
				repeaterChildrenInputData = {};
				repeaterChildrenPrePopulate = {};
				repeaterRequiredChildren = null;
			} else {
				// Repeater Child

				repeaterChildCount +=1;
				var childElement = jQuery(this);
				var childLabel = jQuery(this).children('.gfield_label').text();
				var childId = jQuery(this).attr('id');
				var childIdNum = childId.split('_')[2];
				var childInputs = {};
				var childInputNames = [];
				var childInputCount = 0;
				var childRequired = false;
				var childType;

				if (jQuery(this).has('.ginput_container').length) {
					var childContainerClasses = jQuery(this).find('.ginput_container').attr('class').split(/\s+/);
					var searchFor = 'ginput_container_';

					jQuery.each(childContainerClasses, function(key, value){
						if (value.slice(0, searchFor.length) == searchFor) {
							childType = value.slice(searchFor.length, value.length);
						}
					});
				}

				if (jQuery.inArray(childIdNum, repeaterRequiredChildren) !== -1) { childRequired = true; }

				if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Child #'+repeaterChildCount+' - Found: '+childId); }

				jQuery(this).find(':input').each(function(){
					childInputCount += 1;
					var inputElement = jQuery(this);
					var inputId = jQuery(this).attr('id');
					var inputName = jQuery(this).attr('name');
					var inputName2;
					var inputDefaultValue = gfRepeater_getInputValue(inputElement);
					var inputPrePopulate = {};

					if (inputName) {
						if (jQuery.inArray(inputName, childInputNames) == -1) { childInputNames.push(inputName) }
						if (inputName.slice(-2) == '[]') { inputName2 = inputName.slice(0, inputName.length - 2); } else { inputName2 = inputName; }
						if (repeaterChildrenPrePopulate[inputName2.split('_')[1]]) { inputPrePopulate = repeaterChildrenPrePopulate[inputName2.split('_')[1]]; }
					};

					childInputs[childInputCount] = {element:inputElement,id:inputId,name:inputName,defaultValue:inputDefaultValue,prePopulate:inputPrePopulate};
					if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Child #'+repeaterChildCount+' - Input Found: '+inputId); }
				});

				repeaterChildren[repeaterChildCount] = {element:childElement,id:childId,idNum:childIdNum,inputs:childInputs,inputCount:childInputCount,required:childRequired,type:childType}

				if (!childLabel) {
					childLabel = jQuery(this).children('.gsection_title').text();
					if (childLabel) {
						childInputNames = 'section';
					}
				}

				repeaterChildrenInputData[childIdNum] = childInputNames;
			}
		}
	});

	if (gfRepeater_debug) { console.log('Repeaters Found: '+(repeaterId)); }
	if (repeaterFound !== 0) { return false; }
	return true;
}

/*
	gfRepeater_setRepeaterChildAttrs(repeaterChildElement, repeaterId, repeatCount)
		Adds the repeater ID number and Count number to the end of repeater child ID and name.

		repeaterChildElement	The child element to run the function for.
		repeaterId				The repeater ID to assign the child to.
		repeatCount (Optional)	The repeat count number to assign the child to. If a number is not specified, one will be automatically assigned. A 1 is required the first time this function is used during the setup process.
*/
function gfRepeater_setRepeaterChildAttrs(repeaterChildElement, repeaterId, repeatCount) {
	if (!repeatCount) { var repeatCount = gfRepeater_repeaters[repeaterId]['data']['repeatCount'] + 1; }
	var childId = jQuery(repeaterChildElement).attr('id').split('-')[0];
	var childKey;

	jQuery.each(gfRepeater_repeaters[repeaterId]['children'], function(key, value){
		if (this['id'] == childId) {
			childKey = key;
			return;
		}
	});

	if (childKey) {
		var failedValidation = false;
		var childRequired = gfRepeater_repeaters[repeaterId]['children'][childKey]['required'];
		var childType = gfRepeater_repeaters[repeaterId]['children'][childKey]['type'];

		var newRootId = childId+'-'+repeaterId+'-'+repeatCount;
		jQuery(repeaterChildElement).attr('id', newRootId);

		gfRepeater_replaceShortcodes(repeaterChildElement);
		gfRepeater_doShortcode(repeaterChildElement, 'count', repeatCount);

		jQuery.each(gfRepeater_repeaters[repeaterId]['children'][childKey]['inputs'], function(key, value){
			var inputId = this['id'];
			var inputName = this['name'];
			var inputElement = gfRepeater_findElementByIdOrName(repeaterChildElement, inputId, inputName);

			if (inputId) {
				var newInputId = inputId+'-'+repeaterId+'-'+repeatCount;
				jQuery(inputElement).attr('id', newInputId);
				jQuery(repeaterChildElement).find("label[for^='"+inputId+"']").attr('for', newInputId);
			}

			if (inputName) {
				if (inputName.slice(-2) == '[]') {
					var newInputName = inputName.slice(0, inputName.length - 2)+'-'+repeaterId+'-'+repeatCount+'[]';
				} else {
					var newInputName = inputName+'-'+repeaterId+'-'+repeatCount;
				}

				jQuery(inputElement).attr('name', newInputName);
			}

			var inputMask = jQuery(inputElement).attr('data-mask');
			if (inputMask) { jQuery(inputElement).mask(inputMask); }

			if (this['prePopulate'][repeatCount]) {
				gfRepeater_setInputValue(inputElement, this['prePopulate'][repeatCount]);
			} else if (this['prePopulate'][0]) {
				gfRepeater_setInputValue(inputElement, this['prePopulate'][0]);
			}

			if (gfRepeater_submitted) {
				if (newInputName) {
					var savedValue = jQuery.captures(newInputName);
					if (savedValue) {
						gfRepeater_setInputValue(inputElement, savedValue);
					}
				}

				if (childRequired) {
					var splitName = newInputName.replace('.', '_').split(/(_|-)/);
					if (childType == 'name' && jQuery.inArray(splitName[4], ['3', '6']) == -1) { return true; }
					if (childType == 'address' && jQuery.inArray(splitName[4], ['2']) !== -1) { return true; }

					var inputValue = gfRepeater_getInputValue(inputElement);
					if (!inputValue && repeatCount <= gfRepeater_repeaters[repeaterId]['data']['prevRepeatCount']) {
						failedValidation = true;
					}
				}
			}
		});

		if (childRequired) {
			var childLabel = repeaterChildElement.children('.gfield_label');

			repeaterChildElement.addClass('gfield_contains_required');

			if (!childLabel.has('.gfield_required').length) {
				childLabel.append("<span class=\"gfield_required\">*</span>");
			}

			if (gfRepeater_submitted) {
				if (failedValidation) {
					repeaterChildElement.addClass('gfield_error');
					repeaterChildElement.append("<div class=\"gfield_description validation_message\">This field is required.</div>");
				} else {
					repeaterChildElement.removeClass('gfield_error');
					repeaterChildElement.find('.validation_message').remove();
				}
			}
		}
	};
}

/*
	gfRepeater_doShortcode(element, shortcode, value)
		Finds the 'shortcode' inside of 'element' and replaces it's contents with 'value'.

		element			The element to search inside.
		shortcode		The shortcode to search for.
		value			The value to put inside the shortcode.
*/
function gfRepeater_doShortcode(element, shortcode, value) {
	element.find('.gfRepeater-shortcode-'+shortcode).each(function(){
		jQuery(this).html(value);
	});
}

/*
	gfRepeater_replaceShortcodes(element)
		Replaces any repeater shortcodes with spans for those shortcodes.

		element			The element to search and replace.
*/
function gfRepeater_replaceShortcodes(element) {
	var shortcodes = ['count'];
	var html = element.html();

	jQuery.each(shortcodes, function(key, shortcode){
		element.html(html.replace('[gfRepeater-'+shortcode+']', '<span class=\"gfRepeater-shortcode-'+shortcode+'\"></span>'));
	});
}

/*
	gfRepeater_repeatRepeater(repeaterId)
		Repeats the repeater once.

		repeaterId			The repeater ID number to repeat.
*/
function gfRepeater_repeatRepeater(repeaterId) {
	if (gfRepeater_repeaters[repeaterId]['settings']['max'] && gfRepeater_repeaters[repeaterId]['data']['repeatCount'] >= gfRepeater_repeaters[repeaterId]['settings']['max']) { return; }
	jQuery(gfRepeater_repeaters[repeaterId]['controllers']['start']).closest('form').trigger('beforeRepeat', [repeaterId, gfRepeater_repeaters[repeaterId]['data']['repeatCount'] + 1]);

	var lastElementKey = gfRepeater_repeaters[repeaterId]['data']['childrenCount'];
	var lastElement = gfRepeater_repeaters[repeaterId]['children'][lastElementKey]['element'];
	lastElement = lastElement.attr('id');
	lastElement = jQuery('#'+lastElement.slice(0, -1)+gfRepeater_repeaters[repeaterId]['data']['repeatCount']);

	jQuery.each(gfRepeater_repeaters[repeaterId]['children'], function(key, value){
		var clonedElement = jQuery(this.element).clone();

		gfRepeater_resetInputs(repeaterId, key, clonedElement);
		gfRepeater_setRepeaterChildAttrs(clonedElement, repeaterId);

		clonedElement.insertAfter(lastElement);
		lastElement = clonedElement;
	});

	gfRepeater_repeaters[repeaterId]['data']['repeatCount'] += 1;
	gfRepeater_updateDataElement(repeaterId);
	gfRepeater_updateRepeaterControls(repeaterId);

	jQuery(gfRepeater_repeaters[repeaterId]['controllers']['start']).closest('form').trigger('afterRepeat', [repeaterId, gfRepeater_repeaters[repeaterId]['data']['repeatCount']]);
	if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - repeated'); }
}

/*
	gfRepeater_unrepeatRepeater(repeaterId, repeaterChildId)
		Un-repeats the repeater once.

		repeaterId					The repeater ID number to unrepeat.
		repeaterChildId (Optional)	The repeater child ID number to unrepeat. If an ID number is not specified, the last one will be chosen.
*/
function gfRepeater_unrepeatRepeater(repeaterId, repeaterChildId) {
	if (gfRepeater_repeaters[repeaterId]['data']['repeatCount'] <= gfRepeater_repeaters[repeaterId]['settings']['min']) { return; }
	if (!repeaterChildId) { var repeaterChildId = gfRepeater_repeaters[repeaterId]['data']['repeatCount']; }
	jQuery(gfRepeater_repeaters[repeaterId]['controllers']['start']).closest('form').trigger('beforeUnRepeat', [repeaterId, repeaterChildId]);

	jQuery.each(gfRepeater_repeaters[repeaterId]['children'], function(key, value){
		var childElement = jQuery('#'+this['id']+'-'+repeaterId+'-'+repeaterChildId);
		jQuery(childElement).remove();
	});

	gfRepeater_repeaters[repeaterId]['data']['repeatCount'] -= 1;
	gfRepeater_updateDataElement(repeaterId);
	gfRepeater_updateRepeaterControls(repeaterId);

	jQuery(gfRepeater_repeaters[repeaterId]['controllers']['start']).closest('form').trigger('afterUnRepeat', [repeaterId, repeaterChildId]);
	if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Child #'+repeaterChildId+' - unrepeated'); }
}

/*
	gfRepeater_repeatRepeaterTimes(repeaterId, timesX)
		Repeats the repeater a multiple number of times depeneding on the 'timesX' variable.

		repeaterId			The repeater ID number to repeat.
		timesX (Optional)	The number of times to repeat the repeater. Default is 1.
*/
function gfRepeater_repeatRepeaterTimes(repeaterId, timesX) {
	if (!timesX) { var timesX = 1; }
	for (i = 0; i < timesX; i++) {
		gfRepeater_repeatRepeater(repeaterId);
	}
}

/*
	gfRepeater_unrepeatRepeaterTimes(repeaterId, timesX)
		UnRepeats the repeater a multiple number of times depeneding on the 'timesX' variable.

		repeaterId			The repeater ID number to unrepeat.
		timesX (Optional)	The number of times to unrepeat the repeater. Default is 1.
*/
function gfRepeater_unrepeatRepeaterTimes(repeaterId, timesX) {
	if (!timesX) { var timesX = 1; }
	for (i = 0; i < timesX; i++) {
		gfRepeater_unrepeatRepeater(repeaterId);
	}
}

/*
	gfRepeater_setRepeater(repeaterId, timesX)
		Repeats or unrepeats the repeater to set it to timesX.

		repeaterId		The repeater ID number to repeat or unrepeat.
		timesX			The number to set the repeater to.
*/
function gfRepeater_setRepeater(repeaterId, timesX) {
	var currentRepeatCount = gfRepeater_repeaters[repeaterId]['data']['repeatCount'];

	if (timesX == currentRepeatCount) {
		return;
	} else if (timesX > currentRepeatCount) {
		var timesY = timesX - currentRepeatCount;
		gfRepeater_repeatRepeaterTimes(repeaterId, timesY);
	} else if (timesX < currentRepeatCount) {
		var timesY = currentRepeatCount - timesX;
		gfRepeater_unrepeatRepeaterTimes(repeaterId, timesY);
	}
}

/*
	gfRepeater_updateRepeaterControls(repeaterId)
		Updates the add and remove buttons for the repeater. If the minimum repeat number has been reached, the remove button is hidden. If the maximum number has been reached, the add button is hidden.

		repeaterId		The repeater ID number to update the controls for.
*/
function gfRepeater_updateRepeaterControls(repeaterId) {
	if (gfRepeater_repeaters[repeaterId]['settings']['max']) {
		if (gfRepeater_repeaters[repeaterId]['data']['repeatCount'] >= gfRepeater_repeaters[repeaterId]['settings']['max']) {
			jQuery(gfRepeater_repeaters[repeaterId]['controllers']['add']).hide();
		} else {
			jQuery(gfRepeater_repeaters[repeaterId]['controllers']['add']).show();
		}
	}

	if (gfRepeater_repeaters[repeaterId]['data']['repeatCount'] <= gfRepeater_repeaters[repeaterId]['settings']['min']) {
		jQuery(gfRepeater_repeaters[repeaterId]['controllers']['remove']).hide();
	} else {
		jQuery(gfRepeater_repeaters[repeaterId]['controllers']['remove']).show();
	}
}

/*
	gfRepeater_resetInputs(repeaterId, repeaterChildKey, repeaterChildElement)
		Resets all input elements inside of a repeater child.

		repeaterId				The repeater ID.
		repeaterChildKey		The repeater child ID number.
		repeaterChildElement	The repeater child element.
*/
function gfRepeater_resetInputs(repeaterId, repeaterChildKey, repeaterChildElement) {
	jQuery.each(gfRepeater_repeaters[repeaterId]['children'][repeaterChildKey]['inputs'], function(key, value){
		var inputId = this['id'];
		var inputName = this['name'];
		var inputDefaultValue = this['defaultValue'];
		var inputElement = gfRepeater_findElementByIdOrName(repeaterChildElement, inputId, inputName);

		if (inputElement) {
			gfRepeater_setInputValue(inputElement, inputDefaultValue);
		}
	});
}

/*
	gfRepeater_findElementByIdOrName(searchElement, inputId, inputName)
		Searches for an an element inside of another element by ID or Name. If both an ID and a Name are supplied it will first try the ID and then the Name.

		searchElement			Element to search inside.
		inputId (Optional)		A element ID to search for.
		inputName (Optional)	A element name to search for.
*/
function gfRepeater_findElementByIdOrName(searchElement, elementId, elementName) {
	if (elementId) {
		var foundElement = jQuery(searchElement).find("[id^='"+elementId+"']");
	} else if (elementName) {
		var foundElement = jQuery(searchElement).find("[name^='"+elementName+"']");
	} else { return false; }

	if (foundElement) { return foundElement; } else { return false; }
}

/*
	gfRepeater_getInputValue(inputElement)
		Gets the value of an input.

		inputElement	The input element.
*/
function gfRepeater_getInputValue(inputElement) {
	if (inputElement.is(':checkbox, :radio')) {
		if (inputElement.prop('checked') == true) { return true; } else { return false; }
	} else {
		return inputElement.val();
	}
}

/*
	gfRepeater_setInputValue(inputElement, value)
		Sets the value of an input.

		inputElement	The input element.
		inputValue		The value to set to the input.
*/
function gfRepeater_setInputValue(inputElement, inputValue) {
	if (inputElement.is(':checkbox, :radio')) {
		if (inputValue) { inputElement.prop('checked', true) } else { inputElement.prop('checked', false) }
	} else {
		inputElement.val(inputValue);
	}
}

/*
	gfRepeater_updateDataElement(repeaterId)
		Updates the data element for the repater. The data element stores information that is passed to PHP for processing.

		repeaterId		The repeater ID number to update the data element for.
*/
function gfRepeater_updateDataElement(repeaterId) {
	var dataElement = jQuery(gfRepeater_repeaters[repeaterId]['controllers']['data']);
	var dataArray = JSON.stringify({repeaterId:repeaterId,repeatCount:gfRepeater_repeaters[repeaterId]['data']['repeatCount'],inputData:gfRepeater_repeaters[repeaterId]['data']['inputData']});
	jQuery(dataElement).val(dataArray);
}

/*
	gfRepeater_start()
		Runs the gfRepeater_setRepeaterChildAttrs function for the first set of repeater children and then repeats the repeater a number of times depending on the repeater setting. - Second phase of setup.
*/
function gfRepeater_start() {
	jQuery.each(gfRepeater_repeaters, function(key, value){
		var repeaterId = key;
		var repeatCount = this['settings']['start'];

		if (this['controllers']['data'].attr('data-required')) { this['controllers']['start'].addClass('gfield_contains_required'); }

		jQuery.each(gfRepeater_repeaters[repeaterId]['children'], function(key, value){ gfRepeater_setRepeaterChildAttrs(jQuery(gfRepeater_repeaters[repeaterId]['children'][key]['element']), repeaterId, 1); });

		if (gfRepeater_submitted) { repeatCount = this['data']['prevRepeatCount']; }

		gfRepeater_setRepeater(repeaterId, repeatCount);

		gfRepeater_updateRepeaterControls(repeaterId);
	});
}

// Patch the mask plugin
function gfRepeater_patchMask() {
    var plugin = jQuery.fn.mask;
    jQuery.fn.mask = function(mask) {
        jQuery(this.get(0)).attr('data-mask', mask);
    	return plugin.apply(this, arguments);
    };
}

// Initiation after window has loaded
jQuery(window).load(function() {
	if (gfRepeater_getRepeaters()) {
		gfRepeater_start();
	} else {
		console.log('There was an error with one of your repeaters. This is usually caused by forgetting to include a repeater-end field or by trying to nest repeaters.');
	}
});

// Initiation right away
jQuery(document).ready(function($) {
	gfRepeater_patchMask();
	jQuery('.gform_wrapper form').capture();
	if (jQuery.captures()) { gfRepeater_submitted = true; }
});

// Debug shortcuts
if (gfRepeater_debug) {
	jQuery(window).keydown(function(event){
		// Up Arrow - Prints the contents of gfRepeater_repeaters into the console.
		if (event.which == 38) { console.log(gfRepeater_repeaters); }

		// Down Arrow - Prints the captured form values into the console.
		if (event.which == 40) { console.log(jQuery.captures()); }
	});
}