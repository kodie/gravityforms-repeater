var gfRepeater_debug = gf_repeater_js_admin_strings.debug;
var gfRepeater_repeaters = {};
var gfRepeater_page = gf_repeater_js_admin_strings.page;

function gfRepeater_editforms_getRepeaters() {
	var repeaterFound = 0;
	var repeaterId = 0;
	var repeaterChildren = [];
	var repeaterChildrenIds = [];
	var repeaterStartId;
	var repeaterEndId;

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
				repeaterEndId = this.id;
				gfRepeater_repeaters[repeaterId] = {startId:repeaterStartId,endId:repeaterEndId,childrenIds:repeaterChildrenIds,children:repeaterChildren};

				repeaterChildren = [];
				repeaterChildrenIds = [];
				repeaterFound = 0;
				repeaterStartId = null;
				repeaterEndId = null;
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

function gfRepeater_getIndex(id) {
	var idFound = false;
	var x = -1;

	jQuery('.gfield').each(function(){
		x += 1;

		if (this.id == id) {
			idFound = true;
			return false;
		}
	});

	if (idFound) {
		return x;
	} else {
		return false;
	}
}

function gfRepeater_getRepeaterEndId(id) {
	var pointerInRepeater = false;
	var repeaterEndId;

	jQuery('.gfield').each(function(){
		var field = gfRepeater_getField(this.id);
		var fieldId = gfRepeater_getId(this.id);

		if (!pointerInRepeater) {
			if (field.type == 'repeater' && fieldId == id) {
				pointerInRepeater = true;
			}
		} else {
			if (field.type == 'repeater-end') {
				repeaterEndId = this.id;
				pointerInRepeater = false;
			}
		}
	});

	if (repeaterEndId) {
		return repeaterEndId;
	} else {
		return false;
	}
}

function gfRepeater_isIndexInsideRepeater(index) {
	var pointerInRepeater = false;
	var indexInRepeater = false;
	var x = -1;

	jQuery('.gfield').each(function(){
		x += 1;
		var field = gfRepeater_getField(this.id);

		if (!pointerInRepeater) {
			if (field.type == 'repeater') {
				if (gfRepeater_debug) { console.log('Repeater Start Index: ' + x); }
				pointerInRepeater = true;
			}
		} else {
			if (field.type == 'repeater-end') {
				if (gfRepeater_debug) { console.log('Repeater End Index: ' + x); }
				pointerInRepeater = false;
			} else {
				if (gfRepeater_debug) { console.log('Repeater Child Index: ' + x); }
			}

			if (x == index) {
				indexInRepeater = true;
			}
		}
	});

	if (pointerInRepeater) {
		indexInRepeater = false;
	}

	if (gfRepeater_debug) { console.log('Is the index ' + index + ' inside of a repeater? ' + indexInRepeater); }

	return indexInRepeater;
}

function gfRepeater_brokenRepeater() {
	var pointerInRepeater = false;
	var brokenRepeater = false;
	var x = -1;

	jQuery('.gfield').each(function(){
		x += 1;
		var field = gfRepeater_getField(this.id);

		if (!pointerInRepeater) {
			if (field.type == 'repeater') {
				pointerInRepeater = true;
			} else if (field.type == 'repeater-end') {
				alert('One of your repeaters are missing their repeater start field!');
				brokenRepeater = true;
				return false;
			}
		} else {
			if (field.type == 'repeater') {
				alert('Nesting Repeaters is not supported!');
				brokenRepeater = true;
				return false;
			} else if (field.type == 'repeater-end') {
				pointerInRepeater = false;
			} else {
				var fieldCheck = gfRepeater_editforms_fieldCheck(field.type, x);
				if (!fieldCheck) {
					brokenRepeater = true;
					return false;
				}
			}
		}
	});

	if (!brokenRepeater && pointerInRepeater) {
		alert('One of your repeaters are missing their repeater end field!');
		brokenRepeater = true;
	}

	return brokenRepeater;
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

		repeaterField['repeaterId'] = repeaterId;
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

function gfRepeater_editforms_fieldCheck(type, index) {
	var supportedTypes = ['text', 'textarea', 'select', 'multiselect', 'number',
							'checkbox', 'radio', 'hidden', 'html', 'section',
							'name', 'date', 'time', 'phone', 'address',
							'website', 'email', 'product', 'quanity', 'option',
							'shipping', 'total'];
	
	if (gfRepeater_isIndexInsideRepeater(index)) {
		if (type == 'repeater') {
			alert('Nesting repeaters is not supported!');
			return false;
		} else if (type !== 'repeater-end' && jQuery.inArray(type, supportedTypes) == -1) {
			alert('Sorry, the ' + type + ' field is not supported by the Gravity Forms Repeater Add-On at this time. :(');
			return false;
		}
	}

	return true;
}

function gfRepeater_editforms_patch_SaveForm() {
	var og_SaveForm = SaveForm;

	SaveForm = function(isNew) {
		if (gfRepeater_brokenRepeater()) {
			return false;
		}

		gfRepeater_editforms_update(true);

		return og_SaveForm.call(this, isNew);
	}
}

function gfRepeater_editforms_patch_StartAddField() {
	var og_StartAddField = StartAddField;

	StartAddField = function(type, index) {
		var keepGoing = gfRepeater_editforms_fieldCheck(type, index);

		if (!keepGoing) {
			jQuery('#gform_adding_field_spinner').remove();
			return;
		}

		return og_StartAddField.call(this, type, index);
	};
}

function gfRepeater_editforms_patch_EndAddField() {
	var og_EndAddField = EndAddField;

	EndAddField = function(field, fieldString, index) {
		og_EndAddField.call(this, field, fieldString, index);

		if (field.type == 'repeater') {
			StartAddField('repeater-end', index + 1);
		}
	};
}

function gfRepeater_editforms_patch_StartDeleteField() {
	var og_StartDeleteField = StartDeleteField;

	StartDeleteField = function(element) {
		var fieldId = jQuery(element)[0].id.split("_")[2];
		var field = GetFieldById(fieldId);

		if (field.type == 'repeater-end') {
			alert('This field cannot be deleted directly. Please delete the repeater start field first.');
			return;
		}

		og_StartDeleteField.call(this, element);
	};
}

function gfRepeater_editforms_patch_EndDeleteField() {
	var og_EndDeleteField = EndDeleteField;

	EndDeleteField = function(fieldId) {
		var field = GetFieldById(fieldId);

		if (field.type == 'repeater') {
			var repeaterEndId = gfRepeater_getRepeaterEndId(fieldId);
		}

		og_EndDeleteField.call(this, fieldId);

		if (field.type == 'repeater' && repeaterEndId) {
			repeaterEndId = gfRepeater_getId(repeaterEndId);
			DeleteField(repeaterEndId);
		}
	};
}

function gfRepeater_editforms_patch_SortUpdate() {
	jQuery('#gform_fields').sortable({
		update: function (event, ui) {
			if (gfRepeater_brokenRepeater()) {
				jQuery('#gform_fields').sortable('cancel');
			}
		}
	});
}

jQuery(document).ready(function($) {
	if (gfRepeater_page == 'gf_edit_forms') {
		gfRepeater_editforms_update(false);
	}
});

jQuery(window).load(function() {
	if (gfRepeater_page == 'gf_edit_forms') {
		gfRepeater_editforms_patch_SaveForm();
		gfRepeater_editforms_patch_StartAddField();
		gfRepeater_editforms_patch_EndAddField();
		gfRepeater_editforms_patch_StartDeleteField();
		gfRepeater_editforms_patch_EndDeleteField();
		gfRepeater_editforms_patch_SortUpdate();
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