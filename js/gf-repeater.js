var gfRepeater_debug = false;
var gfRepeater_repeaters = {};

/*
	gfRepeater_getRepeaters()
		Collects all repeater info and stores it inside of the global array "gfRepeater_repeaters". - First phase of setup.
*/
function gfRepeater_getRepeaters() {
	var repeaterFound = 0;
	var repeaterId = 1;
	var repeaterChildren = [];
	var repeaterChildrenData = [];
	var dataElement;

	jQuery('.gfield').each(function(){
		if (repeaterFound == 0) {
			if (jQuery(this).has('.gf-repeater-start').length) {
				if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Start: '+jQuery(this).attr('id')); }
				dataElement = jQuery('#'+this.id+' input.gform_hidden');
				repeaterFound = 1;
			}
		} else {
			if (jQuery(this).has('.gf-repeater-end').length) {
				if (gfRepeater_debug) {
					console.log('Repeater #'+repeaterId+' - End: '+jQuery(this).attr('id'));
					console.log('Repeater #'+repeaterId+' - Children Found: '+repeaterChildren.length);
				}
				var addElement = jQuery('#'+this.id+' .gf-repeater-end .gf-repeater-add');
				var removeElement = jQuery('#'+this.id+' .gf-repeater-end .gf-repeater-remove');
				jQuery(addElement).attr('onClick', 'gfRepeater_repeatRepeater('+repeaterId+');');
				jQuery(removeElement).attr('onClick', 'gfRepeater_unrepeatRepeater('+repeaterId+');');
				var repeaterStart = dataElement.attr('data-start');
				var repeaterMin = dataElement.attr('data-min');
				var repeaterMax = dataElement.attr('data-max');
				if (!repeaterStart) { repeaterStart = 1; }
				if (!repeaterMin) { repeaterMin = 1; }
				if (repeaterMin > repeaterMax) { repeaterMax = null; }
				gfRepeater_repeaters[repeaterId] = {count:1,start:repeaterStart,min:repeaterMin,max:repeaterMax,add:addElement,remove:removeElement,data:dataElement,children:repeaterChildren,childrenData:repeaterChildrenData};
				gfRepeater_updateDataElement(repeaterId);
				repeaterId += 1;
				repeaterChildren = [];
				repeaterChildrenData = [];
				repeaterFound = 0;
			} else {
				repeaterChildren.push(jQuery(this));
				var childLabel = jQuery(this).children('.gfield_label').text();
				var childInputId = jQuery('#' + this.id + ' .ginput_container').children().first().attr('id');
				var childInputName = jQuery('#' + this.id + ' .ginput_container').children().first().attr('name');
				if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Child Found: '+childInputName); }
				repeaterChildrenData.push({inputId:childInputId,inputName:childInputName,label:childLabel});
			}
		}
	});
	if (gfRepeater_debug) { console.log('Repeaters Found: '+(repeaterId-1)); }
}

/*
	gfRepeater_setRepeaterChildAttrs(repeaterChildElement, repeaterId, repeatCount)
		Adds the repeater ID number and Count number to the end of repeater child ID and name.

		repeaterChildElement	The child element to run the function for.
		repeaterId				The repeater ID to assign the child to.
		repeatCount (Optional)	The repeat count number to assign the child to. If a number is not specified, one will be automatically assigned. A 1 is required the first time this function is used during the setup process.
*/
function gfRepeater_setRepeaterChildAttrs(repeaterChildElement, repeaterId, repeatCount) {
	if (!repeatCount) { var repeatCount = gfRepeater_repeaters[repeaterId]['count'] + 1; }
	var oldRootId = jQuery(repeaterChildElement).attr('id');
	var newRootId = oldRootId.split('-')[0]+'-'+repeaterId+'-'+repeatCount;
	jQuery(repeaterChildElement).attr('id', newRootId);
	var inputElement = jQuery('#' + newRootId + ' .ginput_container').children().first();
	var oldInputName = jQuery(inputElement).attr('name');
	if (oldInputName) {
		var newInputName = oldInputName.split('-')[0]+'-'+repeaterId+'-'+repeatCount;
		jQuery(inputElement).attr('name', newInputName);
	}
	var oldInputId = jQuery(inputElement).attr('id');
	if (oldInputId) {
		var newInputId = oldInputId.split('-')[0]+'-'+repeaterId+'-'+repeatCount;
		jQuery(inputElement).attr('id', newInputId);
	}
	jQuery(repeaterChildElement).children('.gfield_label').attr('for', newInputId);
}

/*
	gfRepeater_repeatRepeater(repeaterId)
		Repeats the repeater once.

		repeaterId		The repeater ID number to repeat.
*/
function gfRepeater_repeatRepeater(repeaterId) {
	if (gfRepeater_repeaters[repeaterId]['max'] && gfRepeater_repeaters[repeaterId]['count'] >= gfRepeater_repeaters[repeaterId]['max']) { return; }
	var lastElement = gfRepeater_repeaters[repeaterId]['children'][gfRepeater_repeaters[repeaterId]['children'].length - 1];
	lastElement = lastElement.attr('id');
	lastElement = jQuery('#'+lastElement.slice(0, -1)+gfRepeater_repeaters[repeaterId]['count']);
	jQuery.each(gfRepeater_repeaters[repeaterId]['children'], function(key, value){
		var clonedElement = jQuery(this).clone();
		var inputElement = jQuery(clonedElement).find('.ginput_container').children().first();
		jQuery(inputElement).val('');
		jQuery(clonedElement).insertAfter(lastElement);
		gfRepeater_setRepeaterChildAttrs(jQuery(clonedElement), repeaterId);
		lastElement = clonedElement;
	});
	gfRepeater_repeaters[repeaterId]['count'] += 1;
	gfRepeater_updateDataElement(repeaterId);
	gfRepeater_updateRepeaterControls(repeaterId);
	if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' repeated'); }
}

/*
	gfRepeater_unrepeatRepeater(repeaterId, repeaterChildId)
		Un-repeats the repeater once.

		repeaterId					The repeater ID number to unrepeat.
		repeaterChildId (Optional)	The repeater child ID number to unrepeat. If an ID number is not specified, the last one will be chosen.
*/
function gfRepeater_unrepeatRepeater(repeaterId, repeaterChildId) {
	if (gfRepeater_repeaters[repeaterId]['count'] <= gfRepeater_repeaters[repeaterId]['min']) { return; }
	if (!repeaterChildId) { var repeaterChildId = gfRepeater_repeaters[repeaterId]['count']; }
	jQuery.each(gfRepeater_repeaters[repeaterId]['children'], function(key, value){
		var thisId = jQuery(this).attr('id');
		var childElement = jQuery('#'+thisId.slice(0, -1)+repeaterChildId);
		jQuery(childElement).remove();
	});
	gfRepeater_repeaters[repeaterId]['count'] -= 1;
	gfRepeater_updateDataElement(repeaterId);
	gfRepeater_updateRepeaterControls(repeaterId);
	if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' unrepeated'); }
}

/*
	gfRepeater_updateRepeaterControls(repeaterId)
		Updates the add and remove buttons for the repeater. If the minimum repeat number has been reached, the remove button is hidden. If the maximum number has been reached, the add button is hidden.

		repeaterId		The repeater ID number to update the controls for.
*/
function gfRepeater_updateRepeaterControls(repeaterId) {
	if (gfRepeater_repeaters[repeaterId]['max']) {
		if (gfRepeater_repeaters[repeaterId]['count'] == gfRepeater_repeaters[repeaterId]['max']) {
			jQuery(gfRepeater_repeaters[repeaterId]['add']).hide();
		} else {
			jQuery(gfRepeater_repeaters[repeaterId]['add']).show();
		}
	}
	if (gfRepeater_repeaters[repeaterId]['count'] == gfRepeater_repeaters[repeaterId]['min']) {
		jQuery(gfRepeater_repeaters[repeaterId]['remove']).hide();
	} else {
		jQuery(gfRepeater_repeaters[repeaterId]['remove']).show();
	}
}

/*
	gfRepeater_updateDataElement(repeaterId)
		Updates the data element for the repater. The data element stores information that is passed to PHP for processing.

		repeaterId		The repeater ID number to update the data element for.
*/
function gfRepeater_updateDataElement(repeaterId) {
	var dataElement = jQuery(gfRepeater_repeaters[repeaterId]['data']);
	var dataArray = JSON.stringify({repeaterId:repeaterId,repeatCount:gfRepeater_repeaters[repeaterId]['count'],childrenData:gfRepeater_repeaters[repeaterId]['childrenData']});
	jQuery(dataElement).val(dataArray);
}

/*
	gfRepeater_start()
		Runs the gfRepeater_setRepeaterChildAttrs function for the first set of repeater children and then repeats the repeater a number of times depending on the repeater setting. - Second phase of setup.
*/
function gfRepeater_start() {
	jQuery.each(gfRepeater_repeaters, function(key, value){
		var repeaterId = key;
		jQuery.each(gfRepeater_repeaters[repeaterId]['children'], function(key, value){ gfRepeater_setRepeaterChildAttrs(jQuery(this), repeaterId, 1); });
		for (i = 0; i < gfRepeater_repeaters[repeaterId]['start'] - 1; i++) {
			gfRepeater_repeatRepeater(repeaterId);
		}
		gfRepeater_updateRepeaterControls(repeaterId);
	});
}

// Initiation
jQuery(document).ready(function($) {
	gfRepeater_getRepeaters();
	gfRepeater_start();
});

// Debug function - Display a table filled with the contents of "gfRepeater_repeaters" in the developer console if the "Up" arrow is pressed on the keyboard.
if (gfRepeater_debug) {
	jQuery(window).keydown(function(event){
		if (event.which == 38) { console.table(gfRepeater_repeaters); }
	});
}