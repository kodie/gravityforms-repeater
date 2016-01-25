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
		var parentSection = null;
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
							if (repeaterId == 1 && capturedData['formId'] == formId) {
								gfRepeater_submitted = true;
							}
						}
					}

					if (repeaterId == 1) {
						jQuery(form).capture();
					}

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

					repeaterControllers = {
						add:addElement,
						remove:removeElement,
						data:dataElement,
						start:startElement,
						end:endElement
					};

					var repeaterSettings = {};
					var repeaterStart = Number(repeaterInfo['start']);
					var repeaterMin = Number(repeaterInfo['min']);
					var repeaterMax = Number(repeaterInfo['max']);
					if (!repeaterStart || (repeaterMax && repeaterStart > repeaterMax)) { repeaterStart = 1; }
					if (!repeaterMin || (repeaterMax && repeaterMin > repeaterMax)) { repeaterMin = 1; }
					if (!repeaterMax || (repeaterMin && repeaterMax && repeaterMin > repeaterMax)) { repeaterMax = null; }

					repeaterSettings = {
						start:repeaterStart,
						min:repeaterMin,
						max:repeaterMax
					};

					var repeaterdata = {};
					var repeaterTabIndex = Number(dataElement.attr('tabindex'));
					var prevRepeatCount = null;
					if (gfRepeater_submitted && capturedData) { prevRepeatCount = capturedData['repeatCount']; }

					repeaterdata = {
						repeatCount:1,
						prevRepeatCount:prevRepeatCount,
						childrenCount:repeaterChildCount,
						paremCount:repeaterParemCount,
						tabIndex:repeaterTabIndex,
						inputData:repeaterChildrenInputData
					};

					repeaters[repeaterId] = {
						data:repeaterdata,
						settings:repeaterSettings,
						controllers:repeaterControllers,
						children:repeaterChildren
					};

					// Set back to defaults for the next repeater
					repeaterFound = 0;
					repeaterChildCount = 0;
					repeaterParemCount = 0;
					parentSection = null;
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
					var childInfo = repeaterInfo['children'][childIdNum];
					var childParentSection = parentSection;
					var childType;
					var inputMask;
					var conditionalLogic;

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

					if (childType == 'section') {
						parentSection = repeaterChildCount;
						childParentSection = null;
					}

					if (childInfo['required']) { childRequired = true; }
					if (childInfo['inputMask']) { inputMask = childInfo['inputMask']; }
					if (childInfo['conditionalLogic']) {
						conditionalLogic = childInfo['conditionalLogic'];
						conditionalLogic['skip'] = [];
					}

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

							if (childInfo['prePopulate']) {
								if (childType == 'checkbox' || childType == 'radio') {
									inputPrePopulate = childInfo['prePopulate'];
								} else if (childInfo['prePopulate'][inputName2.split('_')[1]]) {
									inputPrePopulate = childInfo['prePopulate'][inputName2.split('_')[1]];
								}

								if (inputPrePopulate) {
									jQuery.each(inputPrePopulate, function(key, value){
										if (key > repeaterParemCount) { repeaterParemCount = Number(key); }
									});
								}
							}
						};

						childInputs[childInputCount] = {
							element:inputElement,
							id:inputId,
							name:inputName,
							defaultValue:inputDefaultValue,
							prePopulate:inputPrePopulate
						};

						if (gfRepeater_debug) { console.log('Form #'+formId+' - Repeater #'+repeaterId+' - Child #'+repeaterChildCount+' - Input Found: '+inputId); }
					});

					repeaterChildren[repeaterChildCount] = {
						element:childElement,
						id:childId,
						idNum:childIdNum,
						inputs:childInputs,
						inputCount:childInputCount,
						required:childRequired,
						type:childType,
						inputMask:inputMask,
						conditionalLogic:conditionalLogic,
						parentSection:childParentSection
					};

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
	gfRepeater_setRepeaterChildAttrs(formId, repeaterId, repeaterChildElement, repeatId)
		Adds the repeater ID number and Count number to the end of repeater child ID and name.

		formId					The form Id.
		repeaterId				The repeater ID.
		repeaterChildElement	The child element to run the function for.
		repeatId (Optional)		The repeatId to assign the child to. If a number is not specified, one will be automatically assigned. A 1 is required the first time this function is used during the setup process.
*/
function gfRepeater_setRepeaterChildAttrs(formId, repeaterId, repeaterChildElement, repeatId) {
	var repeater = gfRepeater_repeaters[formId][repeaterId];
	if (!repeatId) { var repeatId = repeater['data']['repeatCount'] + 1; }
	var childId = jQuery(repeaterChildElement).attr('id').split('-')[0];
	var childKey = gfRepeater_getIndex(repeater['children'], 'id', childId);
	var checkValidation = jQuery('#gform_wrapper_' + formId).hasClass('gform_validation_error');

	if (childKey) {
		var failedValidation = false;
		var child = repeater['children'][childKey];
		var childRequired = child['required'];
		var childType = child['type'];
		var inputCount = child['inputCount'];
		var inputMask = child['inputMask'];
		var tabindex = repeater['data']['tabIndex'];

		var newRootId = childId+'-'+repeaterId+'-'+repeatId;
		jQuery(repeaterChildElement)
			.attr('id', newRootId)
			.attr('data-repeater-parentId', repeaterId)
			.attr('data-repeater-repeatId', repeatId)
			.attr('data-repeater-childId', childKey)
			.addClass('gf_repeater_child_field');

		gfRepeater_replaceShortcodes(repeaterChildElement);
		gfRepeater_doShortcode(repeaterChildElement, 'count', repeatId);
		gfRepeater_doShortcode(repeaterChildElement, 'buttons', repeater['controllers']['add'].parent().clone());
		gfRepeater_doShortcode(repeaterChildElement, 'add', repeater['controllers']['add'].clone());
		gfRepeater_doShortcode(repeaterChildElement, 'remove', repeater['controllers']['remove'].clone());

		var removeFunction = 'gfRepeater_unrepeatRepeater('+formId+','+repeaterId+','+repeatId+');';
		jQuery(repeaterChildElement)
			.find('.gf_repeater_remove')
			.attr({onclick:removeFunction,onkeypress:removeFunction})
			.show();

		jQuery(repeaterChildElement)
			.find('.gf_repeater_add')
			.show();

		jQuery.each(repeater['children'][childKey]['inputs'], function(key, value){
			var inputId = this['id'];
			var inputName = this['name'];
			var prePopulate = '';

			if (childType == 'radio') {
				var inputElement = gfRepeater_findElementByNameOrId(repeaterChildElement, null, inputId);
			} else {
				var inputElement = gfRepeater_findElementByNameOrId(repeaterChildElement, inputName, inputId);
			}

			inputElement.attr('data-repeater-inputId', key);

			if (inputId) {
				var newInputId = inputId+'-'+repeaterId+'-'+repeatId;
				jQuery(inputElement).attr('id', newInputId);
				jQuery(repeaterChildElement).find("label[for^='"+inputId+"']").attr('for', newInputId);
			}

			if (inputName) {
				if (inputName.slice(-2) == '[]') {
					var newInputName = inputName.slice(0, inputName.length - 2)+'-'+repeaterId+'-'+repeatId+'[]';
				} else {
					var newInputName = inputName+'-'+repeaterId+'-'+repeatId;
				}

				jQuery(inputElement)
					.attr('name', newInputName)
					.attr('tabindex', tabindex);
			}

			if (inputMask) { jQuery(inputElement).mask(inputMask); }

			if (this['prePopulate'][repeatId]) {
				prePopulate = this['prePopulate'][repeatId];
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
				jQuery(inputElement)
					.removeClass('hasDatepicker')
					.datepicker('destroy')
					.siblings('.ui-datepicker-trigger').remove();
			}

			if (gfRepeater_submitted && checkValidation) {
				if (newInputName) {
					var savedValue = jQuery.captures(newInputName);
					if (savedValue) {
						gfRepeater_setInputValue(inputElement, savedValue);
					}
				}

				if (childRequired) {
					if (newInputName) {
						var splitName = newInputName.replace('.', '_').split(/(_|-)/);
						if (childType == 'name' && jQuery.inArray(splitName[4], ['3', '6']) == -1) { return true; }
						if (childType == 'address' && jQuery.inArray(splitName[4], ['2']) !== -1) { return true; }
					}

					var inputValue = gfRepeater_getInputValue(inputElement);
					if (!inputValue && repeatId <= repeater['data']['prevRepeatCount']) {
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

			if (gfRepeater_submitted && checkValidation) {
				if (failedValidation) {
					repeaterChildElement.addClass('gfield_error');
					if (!repeaterChildElement.has('.validation_message').length) {
						repeaterChildElement.append("<div class=\"gfield_description validation_message\">This field is required.</div>");
					}
				} else {
					repeaterChildElement
						.removeClass('gfield_error')
						.find('.validation_message').remove();
				}
			}
		}
	}
}

/*
	gfRepeater_resetRepeaterChildrenAttrs(formId, repeaterId)
		Resets all repeatId's so that they are chronological.
*/
function gfRepeater_resetRepeaterChildrenAttrs(formId, repeaterId) {
	var repeaterChildren = gfRepeater_select(formId, repeaterId);
	var x = 0;

	jQuery(repeaterChildren).each(function(){
		if (jQuery(this).attr('data-repeater-childid') == 1) {
			x += 1;
		}

		if (jQuery(this).attr('data-repeater-repeatid') !== x) {
			gfRepeater_setRepeaterChildAttrs(formId, repeaterId, jQuery(this), x);
		}
	});
}

/*
	gfRepeater_conditionalLogic_set(formId, repeaterId, repeaterChildId, repeatId)
		Runs 'gfRepeater_conditionalLogic_do' and assigns change event for all fields involed with the repeaterChildElement's conditional logic.
*/
function gfRepeater_conditionalLogic_set(formId, repeaterId, repeaterChildId, repeatId) {
	gfRepeater_conditionalLogic_do(formId, repeaterId, repeaterChildId, repeatId);

	var repeater = gfRepeater_repeaters[formId][repeaterId];
	var repeaterChild = repeater['children'][repeaterChildId]
	var conditionalLogic = repeaterChild['conditionalLogic'];

	jQuery.each(conditionalLogic['rules'], function(key, value){
		var fieldId = value['fieldId'];
		var childId = gfRepeater_getIndex(repeater['children'], 'idNum', fieldId);

		if (childId !== false) {
			var inputs = gfRepeater_select(formId, repeaterId, repeatId, childId, '*');
		} else {
			var inputs = jQuery('#field_' + formId + '_' + fieldId + ' :input');
			repeatId = null;
		}

		jQuery.each(inputs, function(key, input){
			jQuery(this).bind('propertychange change click keyup input paste', function(){
				gfRepeater_conditionalLogic_do(formId, repeaterId, repeaterChildId, repeatId);
			});
		});
	});
}

/*
	gfRepeater_conditionalLogic_setAll(formId, repeaterId, repeatId)
		Sets conditionalLogic for all children inside of a repeatId.
*/
function gfRepeater_conditionalLogic_setAll(formId, repeaterId, repeatId) {
	var repeater = gfRepeater_repeaters[formId][repeaterId];
	jQuery.each(repeater['children'], function(key, value){
		if (this.conditionalLogic) {
			gfRepeater_conditionalLogic_set(formId, repeaterId, key, repeatId);
		}
	});
}

/*
	gfRepeater_conditionalLogic_do(formId, repeaterId, repeaterChildId, repeatId)
		Hides or Shows repeaterChildElement depending on conditional logic.
*/
function gfRepeater_conditionalLogic_do(formId, repeaterId, repeaterChildId, repeatId) {
	var repeater = gfRepeater_repeaters[formId][repeaterId];
	var repeaterChild = repeater['children'][repeaterChildId]
	var conditionalLogic = repeaterChild['conditionalLogic'];
	var effectedIds = [repeaterChildId];
	var conditions = [];
	var conditionsPassed = false;
	var hideField = false;

	jQuery.each(conditionalLogic['rules'], function(key, value){
		var condition = false;
		var fieldId = value['fieldId'];
		var childId = gfRepeater_getIndex(repeater['children'], 'idNum', fieldId);

		if (childId !== false) {
			var child = repeater['children'][childId];
			var childElement = gfRepeater_select(formId, repeaterId, repeatId, childId);

			if (child['type'] == 'checkbox' || child['type'] == 'radio') {
				var inputValue = gfRepeater_getChoiceValue(childElement);
				var multiInput = true;
			} else {
				var inputElement = gfRepeater_select(formId, repeaterId, repeatId, childId, 1);
				var inputValue = gfRepeater_getInputValue(inputElement);
				var multiInput = false;
			}
		} else {
			var fieldElement = jQuery('#field_' + formId + '_' + fieldId);
			var firstInput = fieldElement.find(':input').first();

			if (firstInput.is(':checkbox, :radio')) {
				var inputValue = gfRepeater_getChoiceValue(fieldElement);
				var multiInput = true;
			} else {
				var inputValue = gfRepeater_getInputValue(firstInput);
				var multiInput = false;
			}
		}

		if (multiInput) {
			if (jQuery.inArray(value['value'], inputValue) !== -1) { inputValue = value['value']; } else { inputValue = false; }
		}

		condition = gf_matches_operation(inputValue, value['value'], value['operator']);
		conditions.push(condition);
	});

	if (conditionalLogic['logicType'] == 'all') {
		if (jQuery.inArray(false, conditions) == -1) { conditionsPassed = true; }
	} else {
		if (jQuery.inArray(true, conditions) !== -1) { conditionsPassed = true; }
	}

	if ((conditionsPassed && conditionalLogic['actionType'] !== 'show') || (!conditionsPassed && conditionalLogic['actionType'] == 'show')) {
		hideField = true;
	}

	if (repeaterChild['type'] == 'section') {
		var sectionChildren = gfRepeater_getIndex(repeater['children'], 'parentSection', repeaterChildId, true);
		if (sectionChildren !== false) { effectedIds = effectedIds.concat(sectionChildren); }
	}

	jQuery.each(effectedIds, function(key, value){
		var effectedChild = repeater['children'][value];
		var effectedLogic = effectedChild['conditionalLogic'];
		var effectedElement = gfRepeater_select(formId, repeaterId, repeatId, value);
		var skipId = repeatId;

		if (skipId == null) { skipId = 'all'; }

		if (effectedElement.length) {
			if (hideField) {
				effectedElement.hide();

				if (effectedLogic) {
					if (jQuery.inArray(skipId, effectedLogic['skip']) == -1) {
						effectedLogic['skip'].push(skipId);
					}
				}
			} else {
				effectedElement.show();

				if (effectedLogic) {
					if (jQuery.inArray(skipId, effectedLogic['skip']) !== -1) {
						var skipIndex = effectedLogic['skip'].indexOf(skipId);
						effectedLogic['skip'].splice(skipIndex, 1);
					}
				}
			}
		}
	});

	gfRepeater_updateDataElement(formId, repeaterId);
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
	var shortcodes = ['count', 'buttons', 'add', 'remove'];

	jQuery.each(shortcodes, function(key, shortcode){
		var html = element.html();
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
	var repeater = gfRepeater_repeaters[formId][repeaterId];
	var repeatId = repeater['data']['repeatCount'] + 1;
	if (repeater['settings']['max'] && repeater['data']['repeatCount'] >= repeater['settings']['max']) { return; }

	jQuery(repeater['controllers']['start'])
		.parents('form')
		.trigger('gform_repeater_before_repeat', [repeaterId, repeatId]);

	var lastElement = gfRepeater_select(formId, repeaterId).last();

	jQuery.each(repeater['children'], function(key, value){
		var clonedElement = jQuery(this.element).clone();

		gfRepeater_resetInputs(formId, repeaterId, key, clonedElement);
		gfRepeater_setRepeaterChildAttrs(formId, repeaterId, clonedElement);

		clonedElement.insertAfter(lastElement);

		lastElement = clonedElement;
	});

	gfRepeater_conditionalLogic_setAll(formId, repeaterId, repeatId);

	repeater['data']['repeatCount'] += 1;
	gfRepeater_updateDataElement(formId, repeaterId);
	gfRepeater_updateRepeaterControls(formId, repeaterId);

	if (window['gformInitDatepicker']) { gformInitDatepicker(); }

	jQuery(repeater['controllers']['start'])
		.parents('form')
		.trigger('gform_repeater_after_repeat', [repeaterId, repeatId]);

	if (gfRepeater_debug) { console.log('Form #'+formId+' - Repeater #'+repeaterId+' - repeated'); }
}

/*
	gfRepeater_unrepeatRepeater(formId, repeaterId, repeatId)
		Un-repeats the repeater once.

		formId						The form Id.
		repeaterId					The repeater ID number to unrepeat.
		repeatId (Optional)			The repeat ID number to unrepeat. If an ID number is not specified, the last one will be chosen.
*/
function gfRepeater_unrepeatRepeater(formId, repeaterId, repeatId) {
	var repeater = gfRepeater_repeaters[formId][repeaterId];
	if (repeater['data']['repeatCount'] <= repeater['settings']['min']) { return; }
	if (!repeatId) { var repeatId = repeater['data']['repeatCount']; }

	jQuery(repeater['controllers']['start'])
		.parents('form')
		.trigger('gform_repeater_before_unrepeat', [repeaterId, repeatId]);

	jQuery.each(repeater['children'], function(childId, value){
		gfRepeater_select(formId, repeaterId, repeatId, childId).remove();
	});

	repeater['data']['repeatCount'] -= 1;
	gfRepeater_updateDataElement(formId, repeaterId);
	gfRepeater_updateRepeaterControls(formId, repeaterId);

	if (repeatId !== repeater['data']['repeatCount'] + 1) {
		gfRepeater_resetRepeaterChildrenAttrs(formId, repeaterId);
	}

	jQuery(repeater['controllers']['start'])
		.parents('form')
		.trigger('gform_repeater_after_unrepeat', [repeaterId, repeatId]);

	if (gfRepeater_debug) { console.log('Form #'+formId+' - Repeater #'+repeaterId+' - Repeat #'+repeatId+' - unrepeated'); }
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
	var repeater = gfRepeater_repeaters[formId][repeaterId];
	var currentRepeatCount = repeater['data']['repeatCount'];

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
	var repeater = gfRepeater_repeaters[formId][repeaterId];

	if (repeater['settings']['max']) {
		if (repeater['data']['repeatCount'] >= repeater['settings']['max']) {
			jQuery(repeater['controllers']['add']).hide();
		} else {
			jQuery(repeater['controllers']['add']).show();
		}
	}

	if (repeater['data']['repeatCount'] <= repeater['settings']['min']) {
		jQuery(repeater['controllers']['remove']).hide();
	} else {
		jQuery(repeater['controllers']['remove']).show();
	}
}

/*
	gfRepeater_resetInputs(formId, repeaterId, childId, repeaterChildElement)
		Resets all input elements inside of a repeater child.

		formId					The form Id.
		repeaterId				The repeater ID.
		childId					The repeater child ID number.
		repeaterChildElement	The repeater child element.
*/
function gfRepeater_resetInputs(formId, repeaterId, childId, repeaterChildElement) {
	var repeater = gfRepeater_repeaters[formId][repeaterId];
	jQuery.each(repeater['children'][childId]['inputs'], function(key, value){
		var inputId = this['id'];
		var inputName = this['name'];
		var inputDefaultValue = this['defaultValue'];
		var inputElement = gfRepeater_findElementByNameOrId(repeaterChildElement, inputName, inputId);

		if (inputElement) {
			gfRepeater_setInputValue(inputElement, inputDefaultValue);
		}
	});
}

/*
	gfRepeater_select(formId, repeaterId, repeatId, childId, inputId)
		Selects an element depending on the variables passed.

		formId						The form Id.
		repeaterId (Optional)		The repeater Id.
		repeatId (Optional)			The repeat Id.
		childId (Optional)			The child Id.
		inputId (Optional)			The input Id. Also accepts '*' to select all inputs.
*/
function gfRepeater_select(formId, repeaterId, repeatId, childId, inputId) {
	var selector = 'div#gform_wrapper_'+formId+'>form#gform_'+formId;
	if (repeaterId || repeatId || childId || inputId) { selector += '>.gform_body .gform_fields>.gfield.gf_repeater_child_field'; }
	if (repeaterId) { selector += '[data-repeater-parentid='+repeaterId+']'; }
	if (repeatId) { selector += '[data-repeater-repeatid='+repeatId+']'; }
	if (childId) { selector += '[data-repeater-childid='+childId+']'; }
	if (inputId) {
		if (inputId == '*') {
			selector += ' [data-repeater-inputid]';
		} else {
			selector += ' [data-repeater-inputid='+inputId+']';
		}
	}
	return jQuery(selector);
}

/*
	gfRepeater_findElementByNameOrId(searchElement, elementName, elementId)
		Searches for an an element inside of another element by ID or Name. If both an ID and a Name are supplied it will first try the Name and then the ID.

		searchElement			Element to search inside.
		inputName (Optional)	A element name to search for.
		inputId (Optional)		A element ID to search for.
*/
function gfRepeater_findElementByNameOrId(searchElement, elementName, elementId) {
	if (elementName) { var foundElement = jQuery(searchElement).find("[name^='"+elementName+"']"); }
	if (!foundElement && elementId) { var foundElement = jQuery(searchElement).find("[id^='"+elementId+"']"); }
	if (foundElement) { return foundElement; } else { return false; }
}

/*
	gfRepeater_getIndex
		Searches 'object' where 'key' equals 'value'.
		Returns first result if multiple is false.
		Returns array with all key results if multiple is true.
		Returns false if nothing was found.

		object		Object or array to search through.
		key			Key to search for.
		value		Value to search for.
		multiple	Set to true to return all results in an array.
*/
function gfRepeater_getIndex(object, key, value, multiple) {
	var keys = [];

	jQuery.each(object, function(fieldKey, fieldValue){
		if (fieldValue[key] == value) {
			keys.push(fieldKey);
			if (!multiple) { return false; }
		}
	});

	if (keys.length) {
		if (multiple) {
			return keys;
		} else { return keys[0]; }
	} else { return false; }
}

/*
	gfRepeater_getChoiceValue(fieldElement)
		Searches 'fieldElement' for checkboxes and radios. Returns an array with the labels of all the values that are 'checked'.

		fieldElement	The element to search in.
*/
function gfRepeater_getChoiceValue(fieldElement) {
	var value = [];
	jQuery(fieldElement).find(':checkbox, :radio').each(function(){
		if (jQuery(this).prop('checked') == true) {
			var id = this.id;
			var label = jQuery(this).siblings('label').first().text();
			value.push(label);
		}
	});
	return value;
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
	var repeater = gfRepeater_repeaters[formId][repeaterId];
	var dataElement = jQuery(repeater['controllers']['data']);

	var dataArray = jQuery(dataElement).val();
	if (dataArray) { dataArray = JSON.parse(dataArray); }

	dataArray['repeaterId'] = repeaterId;
	dataArray['repeatCount'] = repeater['data']['repeatCount'];

	jQuery.each(dataArray['children'], function(key, value){
		if (Array.isArray(this)) { dataArray['children'][key] = {}; }
		var inputData = repeater['data']['inputData'][key];
		if (inputData.length) {
			dataArray['children'][key]['inputs'] = inputData;
		}
		var fieldIndex = gfRepeater_getIndex(repeater['children'], 'idNum', key);
		dataArray['children'][key]['conditionalLogic'] = repeater['children'][fieldIndex]['conditionalLogic'];
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
		var form = gfRepeater_select(formId);

		jQuery.each(repeater, function(key, value){
			var repeaterId = key;
			var repeater = gfRepeater_repeaters[formId][repeaterId];
			var repeatCount = repeater['settings']['start'];
			var paremCount = repeater['data']['paremCount'];

			if (repeater['controllers']['data'].attr('data-required')) { repeater['controllers']['start'].addClass('gfield_contains_required'); }

			jQuery.each(repeater['children'], function(key, value){
				gfRepeater_setRepeaterChildAttrs(formId, repeaterId, jQuery(repeater['children'][key]['element']), 1);
				if (this.conditionalLogic) { gfRepeater_conditionalLogic_set(formId, repeaterId, key, 1); }
			});

			if (gfRepeater_submitted) {
				repeatCount = repeater['data']['prevRepeatCount'];
			} else if (paremCount > repeatCount) {
				repeatCount = paremCount;
			}

			gfRepeater_setRepeater(formId, repeaterId, repeatCount);
			gfRepeater_updateRepeaterControls(formId, repeaterId);
			gfRepeater_updateDataElement(formId, repeaterId);
		});

		jQuery(form).trigger('gform_repeater_init_done');
	});

	if (window['gformInitDatepicker']) { gformInitDatepicker(); }
}

// Initiation after gravity forms has rendered.
jQuery(document).bind('gform_post_render', function(){
	if (gfRepeater_getRepeaters()) {
		gfRepeater_start();
		jQuery(window).trigger('gform_repeater_init_done');
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