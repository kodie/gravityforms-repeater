var gfRepeater_debug = true;
var gfRepeater_repeaters = {};

/*
	gfRepeater_getRepeaters()
		Collects all repeater info and stores it inside of the global array "gfRepeater_repeaters". - First phase of setup.
*/
function gfRepeater_getRepeaters() {
	var repeaterFound = 0;
	var repeaterId = 0;
	var repeaterChildCount = 0;
	var repeaterChildren = {};
	var childInputData = {};
	var dataElement;

	jQuery('.gfield').each(function(){
		if (repeaterFound == 0) {
			if (jQuery(this).has('.gf-repeater-start').length) {
				repeaterId += 1;

				if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Start: '+jQuery(this).attr('id')); }

				dataElement = jQuery('#'+this.id+' input.gform_hidden');
				repeaterFound = 1;
			}
		} else {
			if (jQuery(this).has('.gf-repeater-end').length) {
				if (gfRepeater_debug) {
					console.log('Repeater #'+repeaterId+' - End: '+jQuery(this).attr('id'));
					console.log('Repeater #'+repeaterId+' - Children Found: '+(repeaterChildCount));
				}

				var repeaterControllers = {};
				var addElement = jQuery('#'+this.id+' .gf-repeater-end .gf-repeater-add');
				var removeElement = jQuery('#'+this.id+' .gf-repeater-end .gf-repeater-remove');
				jQuery(addElement).attr('onClick', 'gfRepeater_repeatRepeater('+repeaterId+');');
				jQuery(removeElement).attr('onClick', 'gfRepeater_unrepeatRepeater('+repeaterId+');');
				repeaterControllers = {add:addElement,remove:removeElement,data:dataElement};

				var repeaterSettings = {};
				var repeaterStart = dataElement.attr('data-start');
				var repeaterMin = dataElement.attr('data-min');
				var repeaterMax = dataElement.attr('data-max');
				if (!repeaterStart) { repeaterStart = 1; }
				if (!repeaterMin) { repeaterMin = 1; }
				if (repeaterMin > repeaterMax) { repeaterMax = null; }
				repeaterSettings = {start:repeaterStart,min:repeaterMin,max:repeaterMax};

				var repeaterdata = {};
				repeaterdata = {repeatCount:1,childrenCount:repeaterChildCount,inputData:childInputData};

				gfRepeater_repeaters[repeaterId] = {data:repeaterdata,settings:repeaterSettings,controllers:repeaterControllers,children:repeaterChildren};

				gfRepeater_updateDataElement(repeaterId);

				repeaterChildCount = 0;
				repeaterChildren = {};
				repeaterFound = 0;
			} else {
				repeaterChildCount +=1;
				var childElement = jQuery(this);
				var childLabel = jQuery(this).children('.gfield_label').text();
				var childId = jQuery(this).attr('id');
				var childInputs = {};
				var childInputNames = [];
				var childInputCount = 1;

				if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Child #'+repeaterChildCount+' - Found: '+childId); }

				jQuery(this).find(':input').each(function(){
					childInputCount += 1;
					var inputElement = jQuery(this);
					var inputId = jQuery(this).attr('id');
					var inputName = jQuery(this).attr('name');
					if (inputName) { if (jQuery.inArray(inputName, childInputNames) == -1) { childInputNames.push(inputName) } };
					childInputs[childInputCount] = {element:inputElement,id:inputId,name:inputName};
					if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Child #'+repeaterChildCount+' - Input Found: '+inputId); }
				});

				repeaterChildren[repeaterChildCount] = {element:childElement,id:childId,inputs:childInputs,inputCount:childInputCount}
				childInputData[childLabel] = childInputNames;
			}
		}
	});
	if (gfRepeater_debug) { console.log('Repeaters Found: '+(repeaterId)); }
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
		var newRootId = childId+'-'+repeaterId+'-'+repeatCount;
		jQuery(repeaterChildElement).attr('id', newRootId);

		jQuery.each(gfRepeater_repeaters[repeaterId]['children'][childKey]['inputs'], function(key, value){
			var inputId = this['id'];
			var inputName = this['name'];

			if (inputId) {
				var inputElement = jQuery(repeaterChildElement).find(":input[id^='"+inputId+"']");
			} else if (inputName) {
				var inputElement = jQuery(repeaterChildElement).find(":input[name^='"+inputName+"']");
			} else { return; }

			if (inputId) {
				var newInputId = inputId+'-'+repeaterId+'-'+repeatCount;
				jQuery(inputElement).attr('id', newInputId);
				jQuery(repeaterChildElement).find("label[for^='"+inputId+"']").attr('for', newInputId);
			}

			if (inputName) {
				var newInputName = inputName+'-'+repeaterId+'-'+repeatCount;
				jQuery(inputElement).attr('name', newInputName);
			}

			var inputMask = jQuery(inputElement).attr('data-mask');
			if (inputMask) { jQuery(inputElement).mask(inputMask); }
		});
	};
}

/*
	gfRepeater_repeatRepeater(repeaterId)
		Repeats the repeater once.

		repeaterId		The repeater ID number to repeat.
*/
function gfRepeater_repeatRepeater(repeaterId) {
	if (gfRepeater_repeaters[repeaterId]['settings']['max'] && gfRepeater_repeaters[repeaterId]['data']['repeatCount'] >= gfRepeater_repeaters[repeaterId]['settings']['max']) { return; }

	var lastElementKey = gfRepeater_repeaters[repeaterId]['data']['childrenCount'];
	var lastElement = gfRepeater_repeaters[repeaterId]['children'][lastElementKey]['element'];
	lastElement = lastElement.attr('id');
	lastElement = jQuery('#'+lastElement.slice(0, -1)+gfRepeater_repeaters[repeaterId]['data']['repeatCount']);

	jQuery.each(gfRepeater_repeaters[repeaterId]['children'], function(key, value){
		var clonedElement = jQuery(this.element).clone();
		gfRepeater_resetInputs(repeaterId, key, clonedElement);
		jQuery(clonedElement).insertAfter(lastElement);
		gfRepeater_setRepeaterChildAttrs(jQuery(clonedElement), repeaterId);
		lastElement = clonedElement;
	});

	gfRepeater_repeaters[repeaterId]['data']['repeatCount'] += 1;
	gfRepeater_updateDataElement(repeaterId);
	gfRepeater_updateRepeaterControls(repeaterId);

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

	jQuery.each(gfRepeater_repeaters[repeaterId]['children'], function(key, value){
		var childElement = jQuery('#'+this['id']+'-'+repeaterId+'-'+repeaterChildId);
		jQuery(childElement).remove();
	});

	gfRepeater_repeaters[repeaterId]['data']['repeatCount'] -= 1;
	gfRepeater_updateDataElement(repeaterId);
	gfRepeater_updateRepeaterControls(repeaterId);

	if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Child #'+repeaterChildId+' - unrepeated'); }
}

/*
	gfRepeater_updateRepeaterControls(repeaterId)
		Updates the add and remove buttons for the repeater. If the minimum repeat number has been reached, the remove button is hidden. If the maximum number has been reached, the add button is hidden.

		repeaterId		The repeater ID number to update the controls for.
*/
function gfRepeater_updateRepeaterControls(repeaterId) {
	if (gfRepeater_repeaters[repeaterId]['settings']['max']) {
		if (gfRepeater_repeaters[repeaterId]['data']['repeatCount'] == gfRepeater_repeaters[repeaterId]['settings']['max']) {
			jQuery(gfRepeater_repeaters[repeaterId]['controllers']['add']).hide();
		} else {
			jQuery(gfRepeater_repeaters[repeaterId]['controllers']['add']).show();
		}
	}

	if (gfRepeater_repeaters[repeaterId]['data']['repeatCount'] == gfRepeater_repeaters[repeaterId]['settings']['min']) {
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

		if (inputId) {
			var inputElement = jQuery(repeaterChildElement).find("[id^='"+inputId+"']");
		} else if (inputName) {
			var inputElement = jQuery(repeaterChildElement).find("[name^='"+inputName+"']");
		} else { return; }

		if (inputElement) {
			if (inputElement.is(':checkbox')) {
				inputElement.prop('checked', false);
			} else {
				inputElement.val('');
			}
		}
	});
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
		jQuery.each(gfRepeater_repeaters[repeaterId]['children'], function(key, value){ gfRepeater_setRepeaterChildAttrs(jQuery(gfRepeater_repeaters[repeaterId]['children'][key]['element']), repeaterId, 1); });

		for (i = 1; i < gfRepeater_repeaters[repeaterId]['settings']['start']; i++) {
			gfRepeater_repeatRepeater(repeaterId);
		}
		gfRepeater_updateRepeaterControls(repeaterId);
	});
}

// Patch the mask plugin
function gfRepeater_patchMask() {
    var plugin = jQuery.fn.mask;
    jQuery.fn.mask = function(mask) {
    	console.log(this.get(0).id+' - '+mask);
        jQuery(this.get(0)).attr('data-mask', mask);
    	return plugin.apply(this, arguments);
    };
}

// Initiation
jQuery(window).load(function() {
	gfRepeater_getRepeaters();
	gfRepeater_start();
});

jQuery(document).ready(function($) {
	gfRepeater_patchMask();
});

// Debug function - Prints the contents of "gfRepeater_repeaters" in the developer console if the "Up" arrow is pressed on the keyboard.
if (gfRepeater_debug) {
	jQuery(window).keydown(function(event){
		if (event.which == 38) { console.log(gfRepeater_repeaters); }
	});
}