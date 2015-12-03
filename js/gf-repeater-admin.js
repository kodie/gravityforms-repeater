var gfRepeater_debug = true;
var gfRepeater_repeaters = {};
var gfRepeater_page = gf_repeater_js_admin_strings.page;

function gfRepeater_editforms_getRepeaters() {
	var repeaterFound = 0;
	var repeaterId = 0;
	var repeaterChildren = [];
	var repeaterChildrenIds = [];
	var repeaterStartId;

	jQuery('.gfield').each(function(){
		if (repeaterFound == 0) {
			if (jQuery(this).has('.gf-repeater-start').length) {
				repeaterId += 1;
				if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Start: '+jQuery(this).attr('id')); }
				repeaterStartId = this.id;
				repeaterFound = 1;
			}
		} else {
			if (jQuery(this).has('.gf-repeater-start').length) { return false; }
			if (jQuery(this).has('.gf-repeater-end').length) {
				if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - End: '+jQuery(this).attr('id')); }
				gfRepeater_repeaters[repeaterId] = {startId:repeaterStartId,childrenIds:repeaterChildrenIds,children:repeaterChildren};
				repeaterChildren = [];
				repeaterChildrenIds = [];
				repeaterFound = 0;
			} else {
				repeaterChildren.push(this);
				repeaterChildrenIds.push(this.id);
				if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Child #'+repeaterChildren.length+' - Found: '+this.id); }
			}
		}
	});

	if (repeaterFound !== 0) { return false; }
	return true;
}

function gfRepeater_getId(id) {
	return id.substr(6);
}

function gfRepeater_getField(id) {
	var idNum = gfRepeater_getId(id);
	return GetFieldById(idNum);
}

function gfRepeater_editforms_getRepeaterId(elementId) {
	jQuery.each(gfRepeater_repeaters, function(key, value){
		if (jQuery.inArray(elementId, this['childrenIds'])) {
			return key;
		}
	});
	return false;
}

function gfRepeater_editforms_update(leaving) {
	if (!gfRepeater_editforms_getRepeaters()) { return; }
	if (leaving) { UpdateFormObject(); }

	jQuery.each(gfRepeater_repeaters, function(key, value){
		var repeaterId = key;
		var repeaterField = gfRepeater_getField(this['startId']);
		var repeaterChildren = [];
		var requiredChildren = [];

		jQuery.each(this['children'], function(key, value){
			var fieldRequired = gfRepeater_editforms_updateRequired(value, leaving);
			var fieldId = gfRepeater_getId(value.id);
			if (fieldRequired) { requiredChildren.push(fieldId); }
			repeaterChildren.push(fieldId);
		});

		repeaterField['repeaterRequiredChildren'] = requiredChildren;
		repeaterField['repeaterChildren'] = repeaterChildren;
	});
}

function gfRepeater_editforms_updateRequired(field, leaving) {
	var fieldId = gfRepeater_getId(field.id);
	var getField = gfRepeater_getField(field.id);
	var gfRequired = getField['isRequired'];
	var repeaterRequired = getField['repeaterField_isRequired'];
	var returnRequired = false;

	if (gfRepeater_debug) { console.log(field.id+' - Before Filter - isRequired:'+getField['isRequired']+' - repeaterField_isRequired:'+getField['repeaterField_isRequired']); }

	if (gfRequired && leaving) {
		getField['isRequired'] = false;
		getField['repeaterField_isRequired'] = true;
		if (gfRepeater_debug) { console.log(field.id+' - Used Filter 1'); }
		returnRequired = true;
	}

	if (!gfRequired && leaving) {
		getField['repeaterField_isRequired'] = false;
		if (gfRepeater_debug) { console.log(field.id+' - Used Filter 2'); }
	}

	if (repeaterRequired && !leaving) {
		jQuery(field).find('.gfield_required').html('*');
		getField['isRequired'] = true;
		getField['repeaterField_isRequired'] = false;
		if (gfRepeater_debug) { console.log(field.id+' - Used Filter 3'); }
	}

	if (!repeaterRequired && !leaving) {
		jQuery(field).find('.gfield_required').html('');
		getField['isRequired'] = false;
		if (gfRepeater_debug) { console.log(field.id+' - Used Filter 4'); }
	}

	if (gfRepeater_debug) { console.log(field.id+' - After Filter - isRequired:'+getField['isRequired']+' - repeaterField_isRequired:'+getField['repeaterField_isRequired']); }

	return returnRequired;
}

function gfRepeater_editforms_updateUpdateButton() {
	var updateButton = jQuery('#floatMenu input.update-form');
	var onClickEvent = updateButton.attr('onclick');
	var addClickEvent = 'gfRepeater_editforms_update(true);';
	var newClickEvent = addClickEvent+onClickEvent;
	updateButton.attr('onclick', newClickEvent);
}

jQuery(document).ready(function($) {
	if (gfRepeater_page == 'gf_edit_forms') {
		gfRepeater_editforms_update(false);
		gfRepeater_editforms_updateUpdateButton();
	}
});

// Debug shortcuts
if (gfRepeater_debug) {
	jQuery(window).keydown(function(event){
		// Up Arrow - Prints the contents of gfRepeater_repeaters into the console.
		if (event.which == 38) { console.log(gfRepeater_repeaters); }

		// Down Arrow - Loop through all of the fields (even non-repeated fields) and output their settings to the console.
		if (event.which == 40) {
			jQuery('.gfield').each(function(){
				console.log(gfRepeater_getField(this.id));
			});
		}
	});
}