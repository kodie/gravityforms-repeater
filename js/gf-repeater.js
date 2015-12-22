var gfRepeater_debug = false;
var gfRepeater_repeaters = {};
var gfRepeater_submitted = false;

/*
	gfRepeater_getRepeaters()
		Collects all repeater info and stores it inside of the global array "gfRepeater_repeaters". - First phase of setup.
*/
function gfRepeater_getRepeaters() {
	var repeaterData = jQuery('.gform_wrapper').each(function(){
		var repeaters = {};
		var formId = this.id.split('_')[2];
		var form = jQuery(this).children('form').first();
		var repeaterId = 0;

		var repeaterFound = 0;
		var repeaterChildCount = 0;
		var repeaterParemCount = 0;
		var repeaterInfo = {};
		var repeaterChildren = {};
		var repeaterChildrenInputData = {};
		var capturedData = {};
		var dataElement;
		var startElement;

		// Remove ajax action from form because ajax enabled forms are not yet supported.
		if (jQuery(form).attr('action') == '/ajax-test') { jQuery(form).removeAttr('action'); }

		jQuery(this).find('.gfield').each(function(){
			if (repeaterFound == 0) {
				if (jQuery(this).has('.ginput_container_repeater').length) {
					// Repeater Start

					repeaterId += 1;

					if (gfRepeater_debug) { console.log('Form #'+formId+' - Repeater #'+repeaterId+' - Start: '+jQuery(this).attr('id')); }

					startElement = jQuery(this);
					dataElement = startElement.find('.gform_repeater');

					repeaterInfo = jQuery(dataElement).val();
					if (repeaterInfo) { repeaterInfo = JSON.parse(repeaterInfo); }

					if (jQuery.captures()) {
						capturedData = jQuery.captures(dataElement.attr('name'));
						if (capturedData) {
							capturedData = JSON.parse(capturedData);
							if (capturedData['formId'] == formId) {
								gfRepeater_submitted = true;
							}
						}
					}

					jQuery(form).capture();

					repeaterFound = 1;
				}
			} else {
				if (jQuery(this).has('.ginput_container_repeater').length) { return false; }
				if (jQuery(this).has('.ginput_container_repeater-end').length) {
					// Repeater End

					if (gfRepeater_debug) {
						console.log('Form #'+formId+' - Repeater #'+repeaterId+' - End: '+jQuery(this).attr('id'));
						console.log('Form #'+formId+' - Repeater #'+repeaterId+' - Children Found: '+(repeaterChildCount));
					}

					var repeaterControllers = {};
					var endElement = jQuery(this);
					var addElement = endElement.find('.gf_repeater_add');
					var removeElement = endElement.find('.gf_repeater_remove');
					var addFunction = 'gfRepeater_repeatRepeater('+formId+','+repeaterId+');';
					var removeFunction = 'gfRepeater_unrepeatRepeater('+formId+','+repeaterId+');';
					jQuery(addElement).attr({onclick:addFunction,onkeypress:addFunction});
					jQuery(removeElement).attr({onclick:removeFunction,onkeypress:removeFunction});
					repeaterControllers = {add:addElement,remove:removeElement,data:dataElement,start:startElement,end:endElement};

					var repeaterSettings = {};
					var repeaterStart = Number(repeaterInfo['start']);
					var repeaterMin = Number(repeaterInfo['min']);
					var repeaterMax = Number(repeaterInfo['max']);
					if (!repeaterStart || (repeaterMax && repeaterStart > repeaterMax)) { repeaterStart = 1; }
					if (!repeaterMin || (repeaterMax && repeaterMin > repeaterMax)) { repeaterMin = 1; }
					if (!repeaterMax || (repeaterMin && repeaterMax && repeaterMin > repeaterMax)) { repeaterMax = null; }
					repeaterSettings = {start:repeaterStart,min:repeaterMin,max:repeaterMax};

					var repeaterdata = {};
					var repeaterTabIndex = Number(dataElement.attr('tabindex'));
					var prevRepeatCount = null;
					if (gfRepeater_submitted && capturedData) { prevRepeatCount = capturedData['repeatCount']; }
					repeaterdata = {repeatCount:1,prevRepeatCount:prevRepeatCount,childrenCount:repeaterChildCount,paremCount:repeaterParemCount,tabIndex:repeaterTabIndex,inputData:repeaterChildrenInputData};

					repeaters[repeaterId] = {data:repeaterdata,settings:repeaterSettings,controllers:repeaterControllers,children:repeaterChildren};

					// Set back to defaults for the next repeater
					repeaterFound = 0;
					repeaterChildCount = 0;
					repeaterParemCount = 0;
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
					var inputMask;

					if (jQuery(this).has('.ginput_container').length) {
						var childContainerClasses = jQuery(this).find('.ginput_container').attr('class').split(/\s+/);
						var searchFor = 'ginput_container_';

						jQuery.each(childContainerClasses, function(key, value){
							if (value.slice(0, searchFor.length) == searchFor) {
								childType = value.slice(searchFor.length, value.length);
							}
						});
					} else if (jQuery(this).hasClass('gform_hidden')) {
						childType = 'hidden';
					} else if (jQuery(this).hasClass('gsection')) {
						childType = 'section';
					}

					if (repeaterInfo['children'][childIdNum]['required']) { childRequired = true; }

					if (repeaterInfo['children'][childIdNum]['inputMask']) { inputMask = repeaterInfo['children'][childIdNum]['inputMask']; }

					if (gfRepeater_debug) { console.log('Form #'+formId+' - Repeater #'+repeaterId+' - Child #'+repeaterChildCount+' - Found: '+childId); }

					jQuery(this).find(':input').each(function(){
						childInputCount += 1;
						var inputElement = jQuery(this);
						var inputId = jQuery(this).attr('id');
						var inputName = jQuery(this).attr('name');
						var inputName2;
						var inputDefaultValue = gfRepeater_getInputValue(inputElement);
						var inputPrePopulate = {};

						if (inputName) {
							if (jQuery.inArray(inputName, childInputNames) == -1) { childInputNames.push(inputName); }
							if (inputName.slice(-2) == '[]') { inputName2 = inputName.slice(0, inputName.length - 2); } else { inputName2 = inputName; }

							if (repeaterInfo['children'][childIdNum]['prePopulate']) {
								if (childType == 'checkbox' || childType == 'radio') {
									inputPrePopulate = repeaterInfo['children'][childIdNum]['prePopulate'];
								} else if (repeaterInfo['children'][childIdNum]['prePopulate'][inputName2.split('_')[1]]) {
									inputPrePopulate = repeaterInfo['children'][childIdNum]['prePopulate'][inputName2.split('_')[1]];
								}

								if (inputPrePopulate) {
									jQuery.each(inputPrePopulate, function(key, value){
										if (key > repeaterParemCount) { repeaterParemCount = Number(key); }
									});
								}
							}
						};

						childInputs[childInputCount] = {element:inputElement,id:inputId,name:inputName,defaultValue:inputDefaultValue,prePopulate:inputPrePopulate};
						if (gfRepeater_debug) { console.log('Form #'+formId+' - Repeater #'+repeaterId+' - Child #'+repeaterChildCount+' - Input Found: '+inputId); }
					});

					repeaterChildren[repeaterChildCount] = {element:childElement,id:childId,idNum:childIdNum,inputs:childInputs,inputCount:childInputCount,required:childRequired,type:childType,inputMask:inputMask}

					repeaterChildrenInputData[childIdNum] = childInputNames;
				}
			}
		});

		if (gfRepeater_debug) { console.log('Form #'+formId+' - Repeaters Found: '+(repeaterId)); }
		if (repeaterFound !== 0) { return false; }

		if (repeaters) {
			gfRepeater_repeaters[formId] = repeaters;
			return true;
		}
	});

	if (repeaterData) { return true; } else { return false; }
}

/*
	gfRepeater_setRepeaterChildAttrs(formId, repeaterId, repeaterChildElement, repeatCount)
		Adds the repeater ID number and Count number to the end of repeater child ID and name.

		formId					The form Id.
		repeaterId				The repeater ID.
		repeaterChildElement	The child element to run the function for.
		repeatCount (Optional)	The repeat count number to assign the child to. If a number is not specified, one will be automatically assigned. A 1 is required the first time this function is used during the setup process.
*/
function gfRepeater_setRepeaterChildAttrs(formId, repeaterId, repeaterChildElement, repeatCount) {
	if (!repeatCount) { var repeatCount = gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount'] + 1; }
	var childId = jQuery(repeaterChildElement).attr('id').split('-')[0];
	var childKey;

	jQuery.each(gfRepeater_repeaters[formId][repeaterId]['children'], function(key, value){
		if (this['id'] == childId) {
			childKey = key;
			return;
		}
	});

	if (childKey) {
		var failedValidation = false;
		var childRequired = gfRepeater_repeaters[formId][repeaterId]['children'][childKey]['required'];
		var childType = gfRepeater_repeaters[formId][repeaterId]['children'][childKey]['type'];
		var inputCount = gfRepeater_repeaters[formId][repeaterId]['children'][childKey]['inputCount'];
		var inputMask = gfRepeater_repeaters[formId][repeaterId]['children'][childKey]['inputMask'];
		var tabindex = gfRepeater_repeaters[formId][repeaterId]['data']['tabIndex'];

		var newRootId = childId+'-'+repeaterId+'-'+repeatCount;
		jQuery(repeaterChildElement).attr('id', newRootId);

		gfRepeater_replaceShortcodes(repeaterChildElement);
		gfRepeater_doShortcode(repeaterChildElement, 'count', repeatCount);

		jQuery.each(gfRepeater_repeaters[formId][repeaterId]['children'][childKey]['inputs'], function(key, value){
			var inputId = this['id'];
			var inputName = this['name'];
			var prePopulate = '';

			if (childType == 'radio') {
				var inputElement = gfRepeater_findElementByIdOrName(repeaterChildElement, null, inputId);
			} else {
				var inputElement = gfRepeater_findElementByIdOrName(repeaterChildElement, inputName, inputId);
			}

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
				jQuery(inputElement).attr('tabindex', tabindex);
			}

			if (inputMask) { jQuery(inputElement).mask(inputMask); }

			if (this['prePopulate'][repeatCount]) {
				prePopulate = this['prePopulate'][repeatCount];
			} else if (this['prePopulate'][0]) {
				prePopulate = this['prePopulate'][0];
			}

			if (prePopulate) {
				if (childType == 'checkbox' || childType == 'radio') {
					prePopulateValues = prePopulate.split(',');
					if (jQuery.inArray(key, prePopulateValues) !== -1) {
						prePopulate = true;
					} else {
						prePopulate = false;
					}
				}

				gfRepeater_setInputValue(inputElement, prePopulate);
			}

			if (window['gformInitDatepicker'] && childType == 'date' && inputCount == 2 && key == 1) {
				jQuery(inputElement).removeClass('hasDatepicker');
				jQuery(inputElement).datepicker('destroy');
				jQuery(inputElement).siblings('.ui-datepicker-trigger').remove();
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
					if (!inputValue && repeatCount <= gfRepeater_repeaters[formId][repeaterId]['data']['prevRepeatCount']) {
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
					if (!repeaterChildElement.has('.validation_message').length) {
						repeaterChildElement.append("<div class=\"gfield_description validation_message\">This field is required.</div>");
					}
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
	gfRepeater_repeatRepeater(formId, repeaterId)
		Repeats the repeater once.

		formId				The form Id.
		repeaterId			The repeater ID number to repeat.
*/
function gfRepeater_repeatRepeater(formId, repeaterId) {
	if (gfRepeater_repeaters[formId][repeaterId]['settings']['max'] && gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount'] >= gfRepeater_repeaters[formId][repeaterId]['settings']['max']) { return; }
	jQuery(gfRepeater_repeaters[formId][repeaterId]['controllers']['start']).closest('form').trigger('beforeRepeat', [repeaterId, gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount'] + 1]);

	var lastElementKey = gfRepeater_repeaters[formId][repeaterId]['data']['childrenCount'];
	var lastElement = gfRepeater_repeaters[formId][repeaterId]['children'][lastElementKey]['element'];
	lastElement = lastElement.attr('id');
	lastElement = jQuery('#'+lastElement.slice(0, -1)+gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount']);

	jQuery.each(gfRepeater_repeaters[formId][repeaterId]['children'], function(key, value){
		var clonedElement = jQuery(this.element).clone();

		gfRepeater_resetInputs(formId, repeaterId, key, clonedElement);
		gfRepeater_setRepeaterChildAttrs(formId, repeaterId, clonedElement);

		clonedElement.insertAfter(lastElement);
		lastElement = clonedElement;
	});

	gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount'] += 1;
	gfRepeater_updateDataElement(formId, repeaterId);
	gfRepeater_updateRepeaterControls(formId, repeaterId);

	if (window['gformInitDatepicker']) { gformInitDatepicker(); }

	jQuery(gfRepeater_repeaters[formId][repeaterId]['controllers']['start']).closest('form').trigger('afterRepeat', [repeaterId, gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount']]);
	if (gfRepeater_debug) { console.log('Form #'+formId+' - Repeater #'+repeaterId+' - repeated'); }
}

/*
	gfRepeater_unrepeatRepeater(formId, repeaterId, repeaterChildId)
		Un-repeats the repeater once.

		formId						The form Id.
		repeaterId					The repeater ID number to unrepeat.
		repeaterChildId (Optional)	The repeater child ID number to unrepeat. If an ID number is not specified, the last one will be chosen.
*/
function gfRepeater_unrepeatRepeater(formId, repeaterId, repeaterChildId) {
	if (gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount'] <= gfRepeater_repeaters[formId][repeaterId]['settings']['min']) { return; }
	if (!repeaterChildId) { var repeaterChildId = gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount']; }
	jQuery(gfRepeater_repeaters[formId][repeaterId]['controllers']['start']).closest('form').trigger('beforeUnRepeat', [repeaterId, repeaterChildId]);

	jQuery.each(gfRepeater_repeaters[formId][repeaterId]['children'], function(key, value){
		var childElement = jQuery('#'+this['id']+'-'+repeaterId+'-'+repeaterChildId);
		jQuery(childElement).remove();
	});

	gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount'] -= 1;
	gfRepeater_updateDataElement(formId, repeaterId);
	gfRepeater_updateRepeaterControls(formId, repeaterId);

	jQuery(gfRepeater_repeaters[formId][repeaterId]['controllers']['start']).closest('form').trigger('afterUnRepeat', [repeaterId, repeaterChildId]);
	if (gfRepeater_debug) { console.log('Form #'+formId+' - Repeater #'+repeaterId+' - Child #'+repeaterChildId+' - unrepeated'); }
}

/*
	gfRepeater_repeatRepeaterTimes(formId, repeaterId, timesX)
		Repeats the repeater a multiple number of times depeneding on the 'timesX' variable.

		formId				The form Id.
		repeaterId			The repeater ID number to repeat.
		timesX (Optional)	The number of times to repeat the repeater. Default is 1.
*/
function gfRepeater_repeatRepeaterTimes(formId, repeaterId, timesX) {
	if (!timesX) { var timesX = 1; }
	for (i = 0; i < timesX; i++) {
		gfRepeater_repeatRepeater(formId, repeaterId);
	}
}

/*
	gfRepeater_unrepeatRepeaterTimes(formId, repeaterId, timesX)
		UnRepeats the repeater a multiple number of times depeneding on the 'timesX' variable.

		formId				The form Id.
		repeaterId			The repeater ID number to unrepeat.
		timesX (Optional)	The number of times to unrepeat the repeater. Default is 1.
*/
function gfRepeater_unrepeatRepeaterTimes(formId, repeaterId, timesX) {
	if (!timesX) { var timesX = 1; }
	for (i = 0; i < timesX; i++) {
		gfRepeater_unrepeatRepeater(formId, repeaterId);
	}
}

/*
	gfRepeater_setRepeater(formId, repeaterId, timesX)
		Repeats or unrepeats the repeater to set it to timesX.

		formId			The form Id.
		repeaterId		The repeater ID number to repeat or unrepeat.
		timesX			The number to set the repeater to.
*/
function gfRepeater_setRepeater(formId, repeaterId, timesX) {
	var currentRepeatCount = gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount'];

	if (timesX == currentRepeatCount) {
		return;
	} else if (timesX > currentRepeatCount) {
		var timesY = timesX - currentRepeatCount;
		gfRepeater_repeatRepeaterTimes(formId, repeaterId, timesY);
	} else if (timesX < currentRepeatCount) {
		var timesY = currentRepeatCount - timesX;
		gfRepeater_unrepeatRepeaterTimes(formId, repeaterId, timesY);
	}
}

/*
	gfRepeater_updateRepeaterControls(formId, repeaterId)
		Updates the add and remove buttons for the repeater. If the minimum repeat number has been reached, the remove button is hidden. If the maximum number has been reached, the add button is hidden.

		formId			The form Id.
		repeaterId		The repeater ID number to update the controls for.
*/
function gfRepeater_updateRepeaterControls(formId, repeaterId) {
	if (gfRepeater_repeaters[formId][repeaterId]['settings']['max']) {
		if (gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount'] >= gfRepeater_repeaters[formId][repeaterId]['settings']['max']) {
			jQuery(gfRepeater_repeaters[formId][repeaterId]['controllers']['add']).hide();
		} else {
			jQuery(gfRepeater_repeaters[formId][repeaterId]['controllers']['add']).show();
		}
	}

	if (gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount'] <= gfRepeater_repeaters[formId][repeaterId]['settings']['min']) {
		jQuery(gfRepeater_repeaters[formId][repeaterId]['controllers']['remove']).hide();
	} else {
		jQuery(gfRepeater_repeaters[formId][repeaterId]['controllers']['remove']).show();
	}
}

/*
	gfRepeater_resetInputs(formId, repeaterId, repeaterChildKey, repeaterChildElement)
		Resets all input elements inside of a repeater child.

		formId					The form Id.
		repeaterId				The repeater ID.
		repeaterChildKey		The repeater child ID number.
		repeaterChildElement	The repeater child element.
*/
function gfRepeater_resetInputs(formId, repeaterId, repeaterChildKey, repeaterChildElement) {
	jQuery.each(gfRepeater_repeaters[formId][repeaterId]['children'][repeaterChildKey]['inputs'], function(key, value){
		var inputId = this['id'];
		var inputName = this['name'];
		var inputDefaultValue = this['defaultValue'];
		var inputElement = gfRepeater_findElementByIdOrName(repeaterChildElement, inputName, inputId);

		if (inputElement) {
			gfRepeater_setInputValue(inputElement, inputDefaultValue);
		}
	});
}

/*
	gfRepeater_findElementByIdOrName(searchElement, elementName, elementId)
		Searches for an an element inside of another element by ID or Name. If both an ID and a Name are supplied it will first try the Name and then the ID.

		searchElement			Element to search inside.
		inputName (Optional)	A element name to search for.
		inputId (Optional)		A element ID to search for.
*/
function gfRepeater_findElementByIdOrName(searchElement, elementName, elementId) {
	if (elementName) { var foundElement = jQuery(searchElement).find("[name^='"+elementName+"']"); }
	if (!foundElement && elementId) { var foundElement = jQuery(searchElement).find("[id^='"+elementId+"']"); }
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
	gfRepeater_updateDataElement(formId, repeaterId)
		Updates the data element for the repater. The data element stores information that is passed to PHP for processing.

		formId			The form Id.
		repeaterId		The repeater ID number to update the data element for.
*/
function gfRepeater_updateDataElement(formId, repeaterId) {
	var dataElement = jQuery(gfRepeater_repeaters[formId][repeaterId]['controllers']['data']);

	var dataArray = jQuery(dataElement).val();
	if (dataArray) { dataArray = JSON.parse(dataArray); }

	dataArray['repeaterId'] = repeaterId;
	dataArray['repeatCount'] = gfRepeater_repeaters[formId][repeaterId]['data']['repeatCount'];

	jQuery.each(dataArray['children'], function(key, value){
		if (Array.isArray(this)) { dataArray['children'][key] = {}; }
		var inputData = gfRepeater_repeaters[formId][repeaterId]['data']['inputData'][key];
		if (inputData.length) {
			dataArray['children'][key]['inputs'] = inputData;
		}
	});

	dataArray = JSON.stringify(dataArray);
	jQuery(dataElement).val(dataArray);
}

/*
	gfRepeater_start()
		Runs the gfRepeater_setRepeaterChildAttrs function for the first set of repeater children and then repeats the repeater a number of times depending on the repeater setting. - Second phase of setup.
*/
function gfRepeater_start() {
	jQuery.each(gfRepeater_repeaters, function(key, repeater){
		var formId = key;

		jQuery.each(repeater, function(key, value){
			var repeaterId = key;
			var repeatCount = this['settings']['start'];
			var paremCount = this['data']['paremCount'];

			if (this['controllers']['data'].attr('data-required')) { this['controllers']['start'].addClass('gfield_contains_required'); }

			jQuery.each(gfRepeater_repeaters[formId][repeaterId]['children'], function(key, value){
				gfRepeater_setRepeaterChildAttrs(formId, repeaterId, jQuery(gfRepeater_repeaters[formId][repeaterId]['children'][key]['element']), 1);
			});

			if (gfRepeater_submitted) {
				repeatCount = this['data']['prevRepeatCount'];
			} else if (paremCount > repeatCount) {
				repeatCount = paremCount;
			}

			gfRepeater_setRepeater(formId, repeaterId, repeatCount);
			gfRepeater_updateRepeaterControls(formId, repeaterId);
			gfRepeater_updateDataElement(formId, repeaterId)
		});
	});

	if (window['gformInitDatepicker']) { gformInitDatepicker(); }
}

// Initiation after gravity forms has rendered.
jQuery(document).bind('gform_post_render', function(){
	if (gfRepeater_getRepeaters()) {
		gfRepeater_start();
	} else {
		console.log('There was an error with one of your repeaters. This is usually caused by forgetting to include a repeater-end field or by trying to nest repeaters.');
	}
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