<?php
public function upgrade($previous_version) {
	if (version_compare($previous_version, '1.0.5') == -1) {
		$forms = GFAPI::get_forms(true);

		foreach ($forms as $form) {
			$entries = GFAPI::get_entries($form['id']);
			$fields = GFAPI::get_fields_by_type($form, 'repeater');

			foreach ($entries as $entry) {
				foreach ($fields as $field) {
					if (array_key_exists($field['id'], $entry)) {
						$dataArray = GFFormsModel::unserialize($entry[$field['id']]);
						$dataUpdated = false;

						if (!is_array($dataArray)) { continue; }

						foreach ($dataArray as $repeaterChildId=>$repeaterChild) {
							foreach ($repeaterChild as $repeatedFieldId=>$repeatedField) {
								if (!is_array($repeatedField)) {
									if ($repeatedField !== '[gfRepeater-section]') {
										$dataUpdated = true;
										$dataArray[$repeaterChildId][$repeatedFieldId] = Array($repeatedField);
									}
								} elseif (reset($repeatedField) == '[gfRepeater-section]') {
									$dataUpdated = true;
									$dataArray[$repeaterChildId][$repeatedFieldId] = reset($repeatedField);
								}
							}
						}

						if ($dataUpdated) { GFAPI::update_entry_field($entry['id'], $field['id'], maybe_serialize($dataArray)); }
					}
				}
			}
		}
	}
}