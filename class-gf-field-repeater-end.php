<?php
class GF_Field_Repeater_End extends GF_Field {
	public $type = 'repeater-end';

	public function get_form_editor_field_title() {
		return 'Repeater End';
	}

	public function get_field_content($value, $force_frontend_label, $form) {
		if (is_admin()) {
			$admin_buttons = $this->get_admin_buttons();
			$field_content = "{$admin_buttons}
							<div class=\"gf-pagebreak-end gf-pagebreak-container gf-repeater-end\">
								<div class=\"gf-pagebreak-text-before\">end repeater</div>
								<div class=\"gf-pagebreak-text-main\"><span>REPEATER</span></div>
								<div class=\"gf-pagebreak-text-after\">end of repeater</div>
							</div>";
		} else {
			$field_content = "<div class=\"gf-repeater-end\">
								<img src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiPjxnIGlkPSJpY29tb29uLWlnbm9yZSI+PC9nPjxwYXRoIGQ9Ik0yNTYgNTEyYy0xNDEuMzc1IDAtMjU2LTExNC42MDktMjU2LTI1NnMxMTQuNjI1LTI1NiAyNTYtMjU2YzE0MS4zOTEgMCAyNTYgMTE0LjYwOSAyNTYgMjU2cy0xMTQuNjA5IDI1Ni0yNTYgMjU2ek0yNTYgNjRjLTEwNi4wMzEgMC0xOTIgODUuOTY5LTE5MiAxOTJzODUuOTY5IDE5MiAxOTIgMTkyYzEwNi4wNDcgMCAxOTItODUuOTY5IDE5Mi0xOTJzLTg1Ljk1My0xOTItMTkyLTE5MnpNMjg4IDM4NGgtNjR2LTk2aC05NnYtNjRoOTZ2LTk2aDY0djk2aDk2djY0aC05NnY5NnoiPjwvcGF0aD48L3N2Zz4=\" class=\"gf-repeater-add\" style=\"cursor:pointer; width:1em; height:1em;\" alt=\"+\">
								<img src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgdmlld0JveD0iMCAwIDUxMiA1MTIiPjxnIGlkPSJpY29tb29uLWlnbm9yZSI+PC9nPjxwYXRoIGQ9Ik0yNTYgMGMtMTQxLjM3NSAwLTI1NiAxMTQuNjI1LTI1NiAyNTYgMCAxNDEuMzkxIDExNC42MjUgMjU2IDI1NiAyNTYgMTQxLjM5MSAwIDI1Ni0xMTQuNjA5IDI1Ni0yNTYgMC0xNDEuMzc1LTExNC42MDktMjU2LTI1Ni0yNTZ6TTI1NiA0NDhjLTEwNi4wMzEgMC0xOTItODUuOTY5LTE5Mi0xOTJzODUuOTY5LTE5MiAxOTItMTkyYzEwNi4wNDcgMCAxOTIgODUuOTY5IDE5MiAxOTJzLTg1Ljk1MyAxOTItMTkyIDE5MnpNMTI4IDI4OGgyNTZ2LTY0aC0yNTZ2NjR6Ij48L3BhdGg+PC9zdmc+\" class=\"gf-repeater-remove\" style=\"cursor:pointer; width:1em; height:1em;\" alt=\"-\">
							</div>";
		}
		return $field_content;
	}
}
GF_Fields::register(new GF_Field_Repeater_End());