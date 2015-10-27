<?php
add_action('init',  array('GF_Field_Repeater_End', 'init'), 20);

class GF_Field_Repeater_End extends GF_Field {
	public $type = 'repeater-end';

	public static function init() {
		if (is_admin()) {
			add_action('gform_field_standard_settings' , array('GF_Field_Repeater_End', 'gform_settings'), 10, 2);
			add_action('gform_editor_js', array('GF_Field_Repeater_End', 'gform_editor'));
			add_filter('gform_tooltips', array('GF_Field_Repeater_End', 'gform_tooltips'));
		}
	}

	public function get_form_editor_field_title() {
		return 'Repeater End';
	}

	public static function gform_settings($position, $form_id) {
		if ($position == 25) {
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

			echo "<li class=\"repeater_end_settings field_setting\">
					<input type=\"checkbox\" id=\"field_repeater_end_donotuse\" onchange=\"SetFieldProperty('donotuse', this.checked);\"> 
					<label for=\"field_repeater_end_donotuse\" class=\"inline\">Do not use add and remove buttons ";

			gform_tooltip('form_field_repeater_end_donotuse');

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
					jQuery('#field_repeater_end_donotuse').prop('checked', field['donotuse']);
				});
			</script>";
	}

	public static function gform_tooltips($tooltips) {
		$tooltips['form_field_repeater_end_add'] = "The HTML to replace the default add button. This HTML will be placed inside of a span tag with the class 'gf-repeater-add'.";
		$tooltips['form_field_repeater_end_remove'] = "The HTML to replace the default remove button. This HTML will be placed inside of a span tag with the class 'gf-repeater-remove'.";
		$tooltips['form_field_repeater_end_donotuse'] = "If enabled, no add and remove buttons will be displayed. This is useful if you plan on using custom javascript to trigger the repeater.";
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
			$donotuse		= $this->donotuse;

			if (empty($add_html)) { $add_html = "<img src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiPjxnIGlkPSJpY29tb29uLWlnbm9yZSI+PC9nPjxwYXRoIGQ9Ik0yNTYgNTEyYy0xNDEuMzc1IDAtMjU2LTExNC42MDktMjU2LTI1NnMxMTQuNjI1LTI1NiAyNTYtMjU2YzE0MS4zOTEgMCAyNTYgMTE0LjYwOSAyNTYgMjU2cy0xMTQuNjA5IDI1Ni0yNTYgMjU2ek0yNTYgNjRjLTEwNi4wMzEgMC0xOTIgODUuOTY5LTE5MiAxOTJzODUuOTY5IDE5MiAxOTIgMTkyYzEwNi4wNDcgMCAxOTItODUuOTY5IDE5Mi0xOTJzLTg1Ljk1My0xOTItMTkyLTE5MnpNMjg4IDM4NGgtNjR2LTk2aC05NnYtNjRoOTZ2LTk2aDY0djk2aDk2djY0aC05NnY5NnoiPjwvcGF0aD48L3N2Zz4=\" style=\"cursor:pointer; width:1em; height:1em;\" alt=\"+\">"; }
			if (empty($remove_html)) { $remove_html = "<img src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiPjxnIGlkPSJpY29tb29uLWlnbm9yZSI+PC9nPjxwYXRoIGQ9Ik0yNTYgMGMtMTQxLjM3NSAwLTI1NiAxMTQuNjI1LTI1NiAyNTYgMCAxNDEuMzkxIDExNC42MjUgMjU2IDI1NiAyNTYgMTQxLjM5MSAwIDI1Ni0xMTQuNjA5IDI1Ni0yNTYgMC0xNDEuMzc1LTExNC42MDktMjU2LTI1Ni0yNTZ6TTI1NiA0NDhjLTEwNi4wMzEgMC0xOTItODUuOTY5LTE5Mi0xOTJzODUuOTY5LTE5MiAxOTItMTkyYzEwNi4wNDcgMCAxOTIgODUuOTY5IDE5MiAxOTJzLTg1Ljk1MyAxOTItMTkyIDE5MnpNMTI4IDI4OGgyNTZ2LTY0aC0yNTZ2NjR6Ij48L3BhdGg+PC9zdmc+\" style=\"cursor:pointer; width:1em; height:1em;\" alt=\"-\">"; }

			$field_content = "<div class=\"ginput_container ginput_container_repeater-end\">\n";

			if (!$donotuse) {
				$field_content .= "<span class=\"gf-repeater-add\" style=\"margin:2px;\">{$add_html}</span>";
				$field_content .= "<span class=\"gf-repeater-remove\" style=\"margin:2px;\">{$remove_html}</span>";
			}

			$field_content .= "</div>";
		}
		return $field_content;
	}
}
GF_Fields::register(new GF_Field_Repeater_End());