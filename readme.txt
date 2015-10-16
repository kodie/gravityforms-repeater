=== Gravity Forms Repeater Add-On ===
Contributors: KodieGrantham
Tags: gravity, forms, repeater
Requires at least: 3.0.1
Tested up to: 4.3.1
Stable tag: trunk

A Gravity Forms add-on that allows specified groups of fields to be repeated by the user.

== Description ==
A Gravity Forms add-on that allows specified groups of fields to be repeated by the user.

= Supported Fields =
*   Date
*   Drop Down
*   Email
*   Paragraph Text
*   Phone
*   Single Line Text
*   Website

= Issues =
*   Not all fields are currently supported. Mostly just fields that return multiple results (checkboxes, lists, etc.).
*   Fields inside of a repeater will return a duplicated item with a blank result outside of the repeat when viewing an indiviual entry (These are only visible if "show empty fields" is checked).
*   Fields inside of a repeater sometimes show a blank colum in the "entries" page. (These can be hidden by changing which columns to display by clicking the gear icon in the upper right-hand corner).
*   Fields inside of a repeater are not able to use Input Masks.

= Check out the source on GitHub! =
<https://github.com/kodie/gravityforms-repeater>

== Installation ==
1. Upload the `gravityforms-repeater` folder to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.

== Screenshots ==
1. Any supported fields placed between the `Repeater` and `Repeater End` will be repeated.
2. A minimum and maximum number may be set to limit how many times a Repeater can be repeated.
3. When activated, 2 new field type buttons will be added to Gravity Forms, `Repeater` and `Repeater End`.
4. A view of the front-end. The only visible difference will be the added `+` and `-` buttons.

== Changelog ==
= 1.0 =
* Initial Release