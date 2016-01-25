<?php
/*
Plugin Name: Gravity Forms Repeater Add-On
Plugin URI: https://wordpress.org/plugins/repeater-add-on-for-gravity-forms/
Description: A Gravity Forms add-on that allows specified groups of fields to be repeated by the user.
Version: 1.0.9
Author: Kodie Grantham
Author URI: http://kodieg.com
GitHub Plugin URI: https://github.com/kodie/gravityforms-repeater
GitHub Branch: master
*/

define('GF_REPEATER_VERSION', '1.0.9');
define('GF_REPEATER_PATH', basename(__DIR__).'/'.basename(__FILE__));

add_filter('plugin_row_meta', 'gfrepeater_row_meta', 10, 2);
function gfrepeater_row_meta($links, $file) {
	if (strpos($file, basename(__FILE__)) !== false) {
		$new_links = array(
			'<a href="http://kodieg.com/projects/gravity-forms-repeater-add-on" target="_blank">Visit plugin site</a>',
			'<a href="https://github.com/kodie/gravityforms-repeater" target="_blank">GitHub</a>'
		);
		$links = array_merge($links, $new_links);
	}
	return $links;
}

if (class_exists("GFForms")) {
	GFForms::include_addon_framework();

	class GFRepeater extends GFAddOn {
		protected $_version = GF_REPEATER_VERSION;
		protected $_min_gravityforms_version = "1.9";
		protected $_slug = "repeateraddon";
		protected $_path = GF_REPEATER_PATH;
		protected $_full_path = __FILE__;
		protected $_title = "Gravity Forms Repeater Add-On";
		protected $_short_title = "Repeater Add-On";

		public function scripts() {
			$scripts = array(
				array(
					"handle"	=> "gf_repeater_js_admin",
					"src"		=> $this->get_base_url() . "/js/gf-repeater-admin.min.js",
					"version"	=> $this->_version,
					"deps"		=> array('jquery'),
					"in_footer"	=> false,
					"callback"	=> array($this, 'localize_scripts'),
					"strings"	=> array('page' => rgget('page')),
					"enqueue"	=> array(
						array(
							"admin_page" => array('form_editor', 'entry_view', 'entry_detail')
						)
					)
				)
			);
			return array_merge(parent::scripts(), $scripts);
		}

		public function init_admin() {
			parent::init_admin();
			GF_Field_Repeater::init_admin();
			GF_Field_Repeater_End::init_admin();
		}

		public function init_frontend() {
			parent::init_frontend();
			GF_Field_Repeater::init_frontend();
		}

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
	}
	new GFRepeater();

	require_once('class-gf-field-repeater.php');
	require_once('class-gf-field-repeater-end.php');
}