<?php
/*
Plugin Name: Gravity Forms Repeater Add-On
Description: A Gravity Forms add-on that allows specified groups of fields to be repeated by the user.
Version: 1.0.0
Author: Kodie Grantham
Author URI: http://kodieg.com
*/

if (class_exists("GFForms")) {
    GFForms::include_addon_framework();

	class GFRepeater extends GFAddOn {
		protected $_version = "1.0.0";
		protected $_min_gravityforms_version = "1.0.0";
		protected $_slug = "repeateraddon";
		protected $_path = "gravityforms-repeater/repeater.php";
		protected $_full_path = __FILE__;
		protected $_title = "Gravity Forms Repeater Add-On";
		protected $_short_title = "Repeater Add-On";
    }
    new GFRepeater();

    add_action('init',  array('GF_Field_Repeater', 'init'), 20);

    require_once('class-gf-field-repeater.php');
    require_once('class-gf-field-repeater-end.php');
}