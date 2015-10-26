var gfRepeater_debug = false;
var gfRepeater_repeaters = {};
var gfRepeater_page = gf_repeater_js_admin_strings.page;

function gfRepeater_editforms_getRepeaters() {
	var repeaterFound = 0;
	var repeaterId = 0;
	var repeaterChildren = [];
	var repeaterStartId;

	jQuery('.gfield').each(function(){
		if (repeaterFound == 0) {
			if (jQuery(this).has('.gf-repeater-start').length) {
				repeaterId += 1;
				if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Start: '+jQuery(this).attr('id')); }
				repeaterStartId = this.id;
				repeaterFound = 1;
			} else {
				var getField = gfRepeater_getField(jQuery(this).attr('id'));
				if (getField['repeaterId']) { getField['repeaterId'] = null; }
			}
		} else {
			if (jQuery(this).has('.gf-repeater-end').length) {
				if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - End: '+jQuery(this).attr('id')); }
				gfRepeater_repeaters[repeaterId] = {startId:repeaterStartId,children:repeaterChildren};
				repeaterChildren = [];
				repeaterFound = 0;
			} else {
				repeaterChildren.push(this);

				var getField = gfRepeater_getField(jQuery(this).attr('id'));
				getField['repeaterId'] = repeaterId;

				if (gfRepeater_debug) { console.log('Repeater #'+repeaterId+' - Child #'+repeaterChildren.length+' - Found: '+this.id); }
			}
		}
	});
}

function gfRepeater_getId(id) {
	return id.substr(6);
}

function gfRepeater_getField(id) {
	var idNum = gfRepeater_getId(id);
	return GetFieldById(idNum);
}

function gfRepeater_editforms_unsetRequired(field) {
	var getField = gfRepeater_getField(field.id);

	if (getField['isRequired']) {
		getField['isRequired'] = false;

		if (!getField['repeaterField_isRequired']) {
			gfRepeater_SetFieldRequired(true, field);
		}

	} else if (getField['repeaterField_isRequired']) {
		gfRepeater_editforms_updateRequired(true, field);
	}
}

function gfRepeater_SetFieldRequired(isRequired, field) {
	if (!field) { field = jQuery('.field_selected'); }

	var fieldId = jQuery(field).attr('id');
	var idNum = gfRepeater_getId(fieldId);
	var getField = gfRepeater_getField(fieldId);

	gfRepeater_editforms_updateRequired(isRequired, field);

	getField['repeaterField_isRequired'] = isRequired;

	var repeaterId = getField['repeaterId'];
	var repeaterFieldId = gfRepeater_repeaters[repeaterId]['startId'];
	var getRepeaterField = gfRepeater_getField(repeaterFieldId);
	var repeaterRequiredChildren = getRepeaterField['repeaterRequiredChildren'];
	var requiredCheck = jQuery.inArray(idNum, repeaterRequiredChildren);
	if (requiredCheck == -1) { requiredCheck = false; } else { requiredCheck = true; }

	if (!requiredCheck && isRequired) {
		repeaterRequiredChildren.push(idNum);
		getRepeaterField['repeaterRequiredChildren'] = repeaterRequiredChildren;
	} else if (requiredCheck && !isRequired) {
		repeaterRequiredChildren.splice(repeaterRequiredChildren.indexOf(idNum), 1);
		getRepeaterField['repeaterRequiredChildren'] = repeaterRequiredChildren;
	}
}

function gfRepeater_editforms_updateRequired(isRequired, field) {
	var required = isRequired ? "*" : "";
	jQuery(field).find('.gfield_required').html(required);
}

function gfRepeater_editforms_updateClick() {
	jQuery('.gf-repeater-child').click(function(){
		var getField = gfRepeater_getField(this.id);
		var requiredCheckbox = jQuery(this).find('input#field_required');
		requiredCheckbox.attr('onclick', 'gfRepeater_SetFieldRequired(this.checked)');
		if (getField['repeaterField_isRequired']) { requiredCheckbox.prop('checked', true); }
	});
}

function gfRepeater_editforms_undoChild(field) {
	var getField = gfRepeater_getField(field.id);
	var requiredCheckbox = jQuery(field).find('input#field_required');
	jQuery(field).removeClass('gf-repeater-child');
	requiredCheckbox.attr('onclick', 'SetFieldRequired(this.checked)');
	if (getField['repeaterField_isRequired']) {
		getField['repeaterField_isRequired'] = null;
		getField['isRequired'] = true;
	}
}

function gfRepeater_editforms_refresh(field) {
	gfRepeater_editforms_getRepeaters();

	if (field) {
		var getField = gfRepeater_getField(field.id);
		var idNum = gfRepeater_getId(field.id);
		if (getField['repeaterId']) {
			jQuery(field).addClass('gf-repeater-child');
			gfRepeater_editforms_unsetRequired(field);
			if (gfRepeater_debug) { console.log(field.id+' is a child of Repeater #'+getField['repeaterId']); }
		}
	}

	jQuery.each(gfRepeater_repeaters, function(key, value){
		var repeaterId = key;
		var repeaterField = gfRepeater_getField(gfRepeater_repeaters[repeaterId]['startId']);
		if (!repeaterField['repeaterRequiredChildren']) { repeaterField['repeaterRequiredChildren'] = []; }
		var repeaterRequiredChildren = repeaterField['repeaterRequiredChildren'];
		if (field && !getField['repeaterId'] && jQuery.inArray(idNum, repeaterRequiredChildren) !== -1) {
			gfRepeater_editforms_undoChild(field);
			repeaterRequiredChildren.splice(repeaterRequiredChildren.indexOf(idNum), 1);
			repeaterField['repeaterRequiredChildren'] = repeaterRequiredChildren;
			if (gfRepeater_debug) { console.log(field.id+' is no longer a child of Repeater #'+repeaterId); }
		}
	});

	gfRepeater_editforms_updateClick();
}

jQuery(window).load(function() {
	if (gfRepeater_page == 'gf_edit_forms') {
		gfRepeater_editforms_refresh();

		jQuery('#gform_fields').sortable({
			stop: function(event, ui) { gfRepeater_editforms_refresh(ui.item[0]); }
		});
	}
});

// Debug shortcuts
if (gfRepeater_debug) {
	jQuery(window).keydown(function(event){
		// Up Arrow - Prints the contents of gfRepeater_repeaters into the console.
		if (event.which == 38) { console.log(gfRepeater_repeaters); }

		// Down Arrow - Prints out which fields are required for each repeater into the console.
		if (event.which == 40) {
			jQuery.each(gfRepeater_repeaters, function(key, value){
				var repeaterId = key;
				var repeaterFieldId = gfRepeater_repeaters[repeaterId]['startId'];
				var getRepeaterField = gfRepeater_getField(repeaterFieldId);
				var repeaterRequiredChildren = getRepeaterField['repeaterRequiredChildren'];
				console.log('Repeater #'+repeaterId+' - Required Fields: '+repeaterRequiredChildren);
			});
		}
	});
}