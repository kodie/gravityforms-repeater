<?php
class GF_Field_Repeater_End extends GF_Field {
	public $type = 'repeater-end';

	public static function init_admin() {
		$admin_page = rgget('page');

		if ($admin_page == 'gf_edit_forms' && !empty($_GET['id'])) {
			add_action('gform_field_standard_settings' , array('GF_Field_Repeater_End', 'gform_standard_settings'), 10, 2);
			add_action('gform_field_appearance_settings' , array('GF_Field_Repeater_End', 'gform_appearance_settings'), 10, 2);
			add_action('gform_editor_js', array('GF_Field_Repeater_End', 'gform_editor'));
			add_filter('gform_tooltips', array('GF_Field_Repeater_End', 'gform_tooltips'));
		}
	}

	public function get_form_editor_field_title() {
		return 'Repeater End';
	}

	public function get_form_editor_field_settings() {
		return array(
			'css_class_setting'
		);
	}

	public static function gform_standard_settings($position, $form_id) {
		if ($position == 1600) {
			echo "<li class=\"repeater_end_settings field_setting\">
					<label for=\"field_repeater_end_add\">Add HTML ";

			gform_tooltip('form_field_repeater_end_add');

			echo "	</label>
					<input type=\"text\" id=\"field_repeater_end_add\" class=\"fieldwidth-3\" size=\"35\" onchange=\"SetFieldProperty('add', this.value);\">
				</li>";

			echo "<li class=\"repeater_end_settings field_setting\">
					<label for=\"field_repeater_end_remove\">Remove HTML ";

			gform_tooltip('form_field_repeater_end_remove');

			echo "	</label>
					<input type=\"text\" id=\"field_repeater_end_remove\" class=\"fieldwidth-3\" size=\"35\" onchange=\"SetFieldProperty('remove', this.value);\">
				</li>";
		}
	}

	public static function gform_appearance_settings($position, $form_id) {
		if ($position == 400) {
			echo "<li class=\"repeater_end_settings field_setting\">
					<input type=\"checkbox\" id=\"field_repeater_end_hideButtons\" onchange=\"SetFieldProperty('hideButtons', this.checked);\"> 
					<label for=\"field_repeater_end_hideButtons\" class=\"inline\">Hide Add & Remove buttons ";

			gform_tooltip('form_field_repeater_end_hideButtons');

			echo "	</label>
				</li>";
		}
	}

	public static function gform_editor() {
		echo "<script type=\"text/javascript\">
				fieldSettings['repeater-end'] += ', .repeater_end_settings';
				jQuery(document).bind('gform_load_field_settings', function(event, field, form){
					jQuery('#field_repeater_end_add').val(field['add']);
					jQuery('#field_repeater_end_remove').val(field['remove']);
					jQuery('#field_repeater_end_hideButtons').prop('checked', field['hideButtons']);
				});
			</script>";
	}

	public static function gform_tooltips($tooltips) {
		$tooltips['form_field_repeater_end_add'] = "The HTML to replace the default add button. This HTML will be placed inside of a span tag with the class 'gf_repeater_add'.";
		$tooltips['form_field_repeater_end_remove'] = "The HTML to replace the default remove button. This HTML will be placed inside of a span tag with the class 'gf_repeater_remove'.";
		$tooltips['form_field_repeater_end_hideButtons'] = "If enabled, no add and remove buttons will be displayed. This is useful if you plan on using custom javascript to trigger the repeater.";
		return $tooltips;
	}

	public function get_field_content($value, $force_frontend_label, $form) {
		if (is_admin()) {
			$admin_buttons	= $this->get_admin_buttons();

			$field_content = "{$admin_buttons}
							<div class=\"gf-pagebreak-end gf-pagebreak-container gf-repeater-end\">
								<div class=\"gf-pagebreak-text-before\">end repeater</div>
								<div class=\"gf-pagebreak-text-main\"><span>REPEATER</span></div>
								<div class=\"gf-pagebreak-text-after\">end of repeater</div>
							</div>";
		} else {
			$add_html		= $this->add;
			$remove_html	= $this->remove;
			$hideButtons	= $this->hideButtons;
			$tabindex		= GFCommon::get_tabindex();

			if (empty($add_html)) { $add_html = "<img class=\"gf_repeater_add_default\" alt=\"+\" src=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\">"; }
			if (empty($remove_html)) { $remove_html = "<img class=\"gf_repeater_remove_default\" alt=\"-\" src=\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\">"; }

			$field_content = "<div class=\"ginput_container ginput_container_repeater-end\">\n";

			if (!$hideButtons) {
				$field_content .= "<span class=\"gf_repeater_add\" {$tabindex}>{$add_html}</span>";
				$field_content .= "<span class=\"gf_repeater_remove\" {$tabindex}>{$remove_html}</span>";
			}

			$field_content .= "</div>";
		}
		return $field_content;
	}
}
GF_Fields::register(new GF_Field_Repeater_End());