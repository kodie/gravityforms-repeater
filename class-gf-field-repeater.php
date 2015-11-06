<?php
add_action('init',  array('GF_Field_Repeater', 'init'), 20);

class GF_Field_Repeater extends GF_Field {
	public $type = 'repeater';

	public static function init() {
		if (!is_admin()) {
			add_action('gform_enqueue_scripts', array('GF_Field_Repeater', 'gform_enqueue_scripts'), 10, 2);
		} else {
			$admin_page = rgget('page');

			if ($admin_page == 'gf_edit_forms' && !empty($_GET['id'])) {
				add_action('gform_field_standard_settings' , array('GF_Field_Repeater', 'gform_settings'), 10, 2);
				add_action('gform_editor_js_set_default_values', array('GF_Field_Repeater', 'gform_set_defaults'));
				add_action('gform_editor_js', array('GF_Field_Repeater', 'gform_editor'));
				add_filter('gform_tooltips', array('GF_Field_Repeater', 'gform_tooltips'));
			}

			if ($admin_page == 'gf_entries') {
				add_filter('gform_form_post_get_meta', array('GF_Field_Repeater', 'gform_hide_children'));
			}
		}
	}

	public static function gform_enqueue_scripts($form, $is_ajax) {
		if (!empty($form)) {
			if (in_array('GF_Field_Repeater', $form)) {
				wp_enqueue_script('_gf_postcapture', plugins_url('js/jquery.postcapture.min.js', __FILE__), array('jquery'));
    			wp_enqueue_script('_gf_repeater', plugins_url('js/gf-repeater.min.js', __FILE__), array('jquery'), '1.0.3');
    			wp_enqueue_style('_gf_repeater', plugins_url('gf-repeater.css', __FILE__), array(), '1.0.3');
    		}
		}
	}

	public function get_form_editor_field_title() {
		return 'Repeater';
	}

	public function get_form_editor_field_settings() {
		return array(
			'admin_label_setting',
			'description_setting',
			'error_message_setting',
			'label_setting'
		);
	}

	public static function gform_set_defaults() {
		echo "
			case \"repeater\" :
				field.label = \"\";
			break;
		";
	}

	public static function gform_settings($position, $form_id) {
		if ($position == 25) {
			echo "<li class=\"repeater_settings field_setting\">
					<label for=\"field_repeater_start\">Start ";

			gform_tooltip('form_field_repeater_start');

			echo "	</label>
					<input type=\"number\" id=\"field_repeater_start\" min=\"1\" value=\"1\" onchange=\"SetFieldProperty('start', this.value);\">
				</li>";

			echo "<li class=\"repeater_settings field_setting\">
					<label for=\"field_repeater_min\">Min ";

			gform_tooltip('form_field_repeater_min');

			echo "	</label>
					<input type=\"number\" id=\"field_repeater_min\" min=\"1\" value=\"1\" onchange=\"SetFieldProperty('min', this.value);\">
				</li>";

			echo "<li class=\"repeater_settings field_setting\">
					<label for=\"field_repeater_max\">Max ";

			gform_tooltip('form_field_repeater_max');

			echo "	</label>
					<input type=\"number\" id=\"field_repeater_max\" min=\"1\" onchange=\"SetFieldProperty('max', this.value);\">
				</li>";
		}
	}

	public static function gform_editor() {
		echo "<script type=\"text/javascript\">
				fieldSettings['repeater'] += ', .repeater_settings';
				jQuery(document).bind('gform_load_field_settings', function(event, field, form){
					jQuery('#field_repeater_start').val(field['start']);
					jQuery('#field_repeater_min').val(field['min']);
					jQuery('#field_repeater_max').val(field['max']);
				});
			</script>";
	}

	public static function gform_tooltips($tooltips) {
		$tooltips['form_field_repeater_start'] = "The number of times the repeater will be repeated when the form is rendered. Leaving this field blank or setting it to a number higher than the maximum number is the same as setting it to 1.";
		$tooltips['form_field_repeater_min'] = "The minimum number of times the repeater is allowed to be repeated. Leaving this field blank or setting it to a number higher than the maximum field is the same as setting it to 1.";
		$tooltips['form_field_repeater_max'] = "The maximum number of times the repeater is allowed to be repeated. Leaving this field blank or setting it to a number lower than the minimum field is the same as setting it to unlimited.";
		return $tooltips;
	}

	function validate($value, $form) {
		$repeater_required = $this->repeaterRequiredChildren;

		if (!empty($repeater_required)) {
			$dataArray = json_decode($value, true);

			if ($dataArray['repeatCount'] < $this->min) {
				$this->failed_validation  = true;
				$this->validation_message = "A minimum number of ".$this->min." is required.";
				return;
			}

			if ($this->max && $dataArray['repeatCount'] > $this->max) {
				$this->failed_validation  = true;
				$this->validation_message = "A maximum number of ".$this->max." is allowed.";
				return;
			}

			for ($i = 1; $i < $dataArray['repeatCount'] + 1; $i++) {
				foreach ($dataArray['inputData'] as $inputLabel=>$inputNames) {
					foreach ($inputNames as $inputName) {
						$getInputName = $inputName.'-'.$dataArray['repeaterId'].'-'.$i;
						$getFilterdInputName = str_replace('.', '_', strval($getInputName));
						$getInputData = rgpost($getFilterdInputName);
						$getInputIdNum = explode("_", $getFilterdInputName)[1];

						if (in_array($getInputIdNum, $repeater_required) && empty($getInputData)) {
							$this->failed_validation  = true;
							if ($this->errorMessage) { $this->validation_message = $this->errorMessage; } else { $this->validation_message = "A required field was left blank."; }
							return;
						}
					}
				}
			}
		}
	}

	public function get_field_content($value, $force_frontend_label, $form) {
		if (is_admin()) {
			$admin_buttons = $this->get_admin_buttons();
			$field_content = "{$admin_buttons}
							<div class=\"gf-pagebreak-first gf-pagebreak-container gf-repeater gf-repeater-start\">
								<div class=\"gf-pagebreak-text-before\">begin repeater</div>
								<div class=\"gf-pagebreak-text-main\"><span>REPEATER</span></div>
								<div class=\"gf-pagebreak-text-after\">top of repeater</div>
							</div>";
		} else {
			$field_label		= $this->get_field_label($force_frontend_label, $value);
			$description		= $this->get_description($this->description, 'gsection_description gf_repeater_description');
			$validation_message = ( $this->failed_validation && ! empty( $this->validation_message ) ) ? sprintf( "<div class='gfield_description validation_message'>%s</div>", $this->validation_message ) : '';
			if (!empty($field_label)) { $field_label = "<h2 class='gf_repeater_title'>{$field_label}</h2>"; } else { $field_label = ''; }
			$field_content = "<div class=\"ginput_container ginput_container_repeater\">{$field_label}{FIELD}</div>{$description}{$validation_message}";
		}
		return $field_content;
	}

	public function get_field_input($form, $value = '', $entry = null) {
		$form_id			= $form['id'];
		$is_entry_detail	= $this->is_entry_detail();
		$is_form_editor		= $this->is_form_editor();
		$id					= (int) $this->id;
		$field_id			= $is_entry_detail || $is_form_editor || $form_id == 0 ? "input_$id" : 'input_' . $form_id . "_$id";
		$repeater_start		= $this->start;
		$repeater_min		= $this->min;
		$repeater_max		= $this->max;
		$repeater_required	= $this->repeaterRequiredChildren;
		if (!empty($repeater_required)) { $repeater_required = implode(',', $repeater_required); } else { $repeater_required = ''; }
		return sprintf("<input name='input_%d' id='%s' type='hidden' class='gform_hidden' data-start='%s' data-min='%s' data-max='%s' data-required='%s' value='%s' />", $id, $field_id, $repeater_start, $repeater_min, $repeater_max, $repeater_required, $value);
	}

	public function get_value_save_entry($value, $form, $input_name, $lead_id, $lead) {
		$dataArray = json_decode($value, true);
		$value = Array();

		for ($i = 1; $i < $dataArray['repeatCount'] + 1; $i++) {
			foreach ($dataArray['inputData'] as $inputLabel=>$inputNames) {
				$inputData = Array();

				if (is_array($inputNames)) {
					foreach ($inputNames as $inputName) {
						$getInputName = $inputName.'-'.$dataArray['repeaterId'].'-'.$i;
						$getInputData = rgpost(str_replace('.', '_', strval($getInputName)));
						if (!empty($getInputData)) { $inputData[] = $getInputData; }
					}
				} else {
					if ($inputNames == 'section') { $inputData[] = '[gfRepeater-section]'; }
				}

				$childValue[$inputLabel] = $inputData;
			}
			$value[$i] = $childValue;
		}

		return maybe_serialize($value);
	}

	public function get_value_entry_list($value, $entry, $field_id, $columns, $form) {
		if (empty($value)) {
			return '';
		} else {
			$dataArray = GFFormsModel::unserialize($value);
			$arrayCount = count($dataArray);
			if ($arrayCount > 1) { $returnText = $arrayCount.' entries'; } else { $returnText = $arrayCount.' entry'; }
			return $returnText;
		}
	}

	public function get_value_entry_detail($value, $currency = '', $use_text = false, $format = 'html', $media = 'screen') {
		if (empty($value)) {
			return '';
		} else {
			$dataArray = GFFormsModel::unserialize($value);
			$arrayCount = count($dataArray);
			$output = "";
			$count = 0;
			$repeatCount = 0;
			$display_empty_fields = rgget('gf_display_empty_fields', $_COOKIE);

			foreach ($dataArray as $key=>$value) {
				$repeatCount++;
				$tableContents = '';

				if (!empty($value) && !is_array($value)) {
					$save_value = $value;
					unset($value);
					$value[0] = $save_value;
				}

				foreach ($value as $childKey=>$childValue) {
					$childValueOutput = '';
					
					if (empty($display_empty_fields) && count($childValue) == 0) { continue; } else { $count++; }

					$entry_title = str_replace('[gfRepeater-count]', $repeatCount, $childKey);

					if ($childValue[0] == '[gfRepeater-section]') {
						$tableClass = 'entry-view-section-break';
					} else {
						$tableClass = 'entry-view-field-name';
					}

					$tableContents .= "<tr>\n<td colspan=\"2\" class=\"".$tableClass."\">".$entry_title."</td>\n</tr>\n";

					if (count($childValue) == 1) {
						$childValueOutput = $childValue[0];
					} elseif (count($childValue) > 1) {
						$childValueOutput = "<ul>\n";

						foreach ($childValue as $childValueData) {
							$childValueOutput .= "<li>".$childValueData."</li>";
						}
						
						$childValueOutput .= "</ul>\n";
					}

					if ($childValueOutput !== '[gfRepeater-section]') {
						$tableContents .= "<tr>\n<td colspan=\"2\" class=\"entry-view-field-value\">".$childValueOutput."</td>\n</tr>\n";
					}
				}

				if (!empty($tableContents)) {
					$output .= "<table cellspacing=\"0\" class=\"widefat fixed entry-detail-view\">\n";
					$output .= $tableContents;
					$output .= "</table>\n";
				}
			}
		}

		if ($count !== 0) { return $output; } else { return ''; }
	}

	public static function gform_hide_children($form) {
		$form_id = $form['id'];
		$repeaterChildren = Array();
		$grid_modified = false;
		$grid_meta = GFFormsModel::get_grid_column_meta($form_id);

		foreach($form['fields'] as $key=>$field) {
			if ($field->type == 'repeater') {
				if (is_array($field->repeaterChildren)) { $repeaterChildren = array_merge($repeaterChildren, $field->repeaterChildren); }
			} elseif ($field->type == 'repeater-end') { array_push($repeaterChildren, $field->id); }

			if (!empty($repeaterChildren)) {
				if (in_array($field->id, $repeaterChildren)) {
					unset($form['fields'][$key]);

					if (is_array($grid_meta)) {
						$grid_pos = array_search($field->id, $grid_meta);
						if ($grid_pos) {
							$grid_modified = true;
							unset($grid_meta[$grid_pos]);
						}
					}
				}
			}
		}

		if ($grid_modified) { GFFormsModel::update_grid_column_meta($form_id, $grid_meta); }

		$form['fields'] = array_values($form['fields']);

		return $form;
	}
}
GF_Fields::register(new GF_Field_Repeater());