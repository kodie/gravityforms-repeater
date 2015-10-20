<?php
class GF_Field_Repeater extends GF_Field {
	public $type = 'repeater';

	public static function init() {
		if (!is_admin()) {
			add_action('gform_enqueue_scripts', array('GF_Field_Repeater', 'gform_enqueue_scripts'), 10, 2);
		} else {
			add_action('gform_field_standard_settings' , array('GF_Field_Repeater', 'gform_settings'), 10, 2);
			add_action('gform_editor_js', array('GF_Field_Repeater', 'gform_editor'));
			add_filter('gform_tooltips', array('GF_Field_Repeater', 'gform_tooltips'));
		}
	}

	public static function gform_enqueue_scripts($form, $is_ajax) {
		if (!empty($form)) {
			if (in_array('GF_Field_Repeater', $form)) {
    			wp_enqueue_script('_gf_repeater', plugins_url('js/gf-repeater.min.js', __FILE__), array('jquery'));
    		}
		}
	}

	public function get_form_editor_field_title() {
		return 'Repeater';
	}

	public function get_form_editor_field_settings() {
		return array(
			'admin_label_setting'
		);
	}

	public static function gform_settings($position, $form_id) {
		if ($position == 25) {
			echo "<li class=\"repeater_settings field_setting\">
					<label for=\"field_repeater_min\">Min ";

			gform_tooltip('form_field_repeater_min');

			echo "	</label>
					<input type=\"number\" id=\"field_repeater_min\" min=\"1\" value=\"1\" onchange=\"SetFieldProperty('min', this.value);\" required>
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
					jQuery('#field_repeater_min').val(field['min']);
					jQuery('#field_repeater_max').val(field['max']);
				});
			</script>";
	}

	public static function gform_tooltips($tooltips) {
		$tooltips['form_field_repeater_min'] = "The minimum number of times the repeater is allowed to be repeated. Leaving this field blank is the same as setting it to 1.";
		$tooltips['form_field_repeater_max'] = "The maximum number of times the repeater is allowed to be repeated. Leaving this field blank or setting it to a number lower than the minimum field is the same as setting it to unlimited.";
		return $tooltips;
	}

	public function get_field_content($value, $force_frontend_label, $form) {
		if (is_admin()) {
			$admin_buttons = $this->get_admin_buttons();
			$field_content = "{$admin_buttons}
							<div class=\"gf-pagebreak-first gf-pagebreak-container gf-repeater\">
								<div class=\"gf-pagebreak-text-before\">begin repeater</div>
								<div class=\"gf-pagebreak-text-main\"><span>REPEATER</span></div>
								<div class=\"gf-pagebreak-text-after\">top of repeater</div>
							</div>";
		} else {
			$field_content = "<div class=\"gf-repeater-start\"></div>{FIELD}";
		}
		return $field_content;
	}

	public function get_field_input($form, $value = '', $entry = null) {
		$form_id			= $form['id'];
		$is_entry_detail	= $this->is_entry_detail();
		$is_form_editor		= $this->is_form_editor();
		$id					= (int) $this->id;
		$field_id			= $is_entry_detail || $is_form_editor || $form_id == 0 ? "input_$id" : 'input_' . $form_id . "_$id";
		$disabled_text		= $is_form_editor ? 'disabled="disabled"' : '';
		$repeater_min		= $this->min;
		$repeater_max		= $this->max;
		return sprintf("<input name='input_%d' id='%s' type='hidden' class='gform_hidden' data-start='".$repeater_min."' data-min='".$repeater_min."' data-max='".$repeater_max."' value='' %s/>", $id, $field_id, esc_attr($value), $disabled_text);
	}

	public function get_value_save_entry($value, $form, $input_name, $lead_id, $lead) {
		$dataArray = json_decode($value, true);
		$value = Array();

		for ($i = 1; $i < $dataArray['repeatCount'] + 1; $i++) {
			foreach ($dataArray['inputData'] as $inputLabel=>$inputNames) {
				$inputData = Array();
				foreach ($inputNames as $inputName) {
					$getInputName = $inputName.'-'.$dataArray['repeaterId'].'-'.$i;
					$getInputData = rgpost(str_replace('.', '_', strval($getInputName)));
					if (!empty($getInputData)) { $inputData[] = $getInputData; }
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

			foreach ($dataArray as $key=>$value) {
				$output .= "<table cellspacing=\"0\" class=\"widefat fixed entry-detail-view\">\n";
				foreach ($value as $childKey=>$childValue) {
					if (count($childValue) == 0) { continue; } else { $count++; }

					$output .= "<tr>\n<td colspan=\"2\" class=\"entry-view-field-name\">".$childKey."</td>\n</tr>\n";

					if (count($childValue) == 1) {
						$childValueOutput = $childValue[0];
					} elseif (count($childValue) > 1) {
						$childValueOutput = "<ul>\n";

						foreach ($childValue as $childValueData) {
							$childValueOutput .= "<li>".$childValueData."</li>";
						}
						
						$childValueOutput .= "</ul>\n";
					}

					$output .= "<tr>\n<td colspan=\"2\" class=\"entry-view-field-value\">".$childValueOutput."</td>\n</tr>\n";
				}

				$output .= "</table>\n";
			}
		}

		if ($count !== 0) { return $output; } else { return ''; }
	}
}
GF_Fields::register(new GF_Field_Repeater());