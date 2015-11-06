=== Gravity Forms Repeater Add-On ===
Contributors: KodieGrantham
Tags: gravity, forms, repeater
Requires at least: 3.0.1
Tested up to: 4.3.1
Stable tag: 1.0.4

A Gravity Forms add-on that allows specified groups of fields to be repeated by the user.

== Description ==
A Gravity Forms add-on that allows specified groups of fields to be repeated by the user.

= Supported Fields =
* Address
* Checkboxes
* Date
* Drop Down
* Email
* HTML
* Name
* Number
* Paragraph Text
* Phone
* Single Line Text
* Website

= Features =
* Repeat groups of fields multiple times
* Use multiple repeaters on the same form
* Use shortcodes to display data to the user
* Use Javascript to manipulate the repeater (See GitHub Page)
* Customize the add and remove button's HTML

= Issues =
* Not all fields are currently supported.
* Ajax enabled forms are not supported.

= Shortcodes =
You can place shortcodes inside of input labels, input descriptions, and HTML blocks!

* [gfRepeater-count] - Will output the current repeat number.

= Check out the source on GitHub! =
<https://github.com/kodie/gravityforms-repeater>

== Installation ==
1. Upload the `gravityforms-repeater` folder to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.

== Frequently Asked Questions ==
= Can I use multiple repeaters in one form? =
Yes!

= Can I nest repeaters? =
Unfortunately nesting repeaters is not supported at this time.

== Screenshots ==
1. Any supported fields placed between the `Repeater` and `Repeater End` will be repeated.
2. A minimum and maximum number may be set to limit how many times a Repeater can be repeated.
3. When activated, 2 new field type buttons will be added to Gravity Forms, `Repeater` and `Repeater End`.
4. A view of the front-end. The only visible difference will be the added `+` and `-` buttons.

== Changelog ==
= 1.0.4 =
* Fixed bug with number field where a PHP error would show up if a form failed validation.
* Fixed bug where a javascript error would occur if no repeater children were marked as required.
* Fixed bug where a PHP error would sometimes occur on the entries page in the admin panel if a repeated field was submitted blank.
* Added support for Section field type.
* Default validation functions are now bypassed for repeater children.
* gfRepeater-count shortcode now shows up for field titles on the entires page in the admin panel.
* Blank repeated fields now show up if "Show Empty Fields" is enabled.
* Repeater children and repeater end fields no longer display duplicated results on the entries page in the admin panel.
* Added a little bit of backwards compatibility for fetching saved repeater child entry data.

= 1.0.3 =
* Fixed bug where repeated fields would look like they failed validation if any repeated fields before them failed.
* Fixed bug with validation on fields with multiple inputs.
* Fixed bugs with form editor and setting repeater children required option.
* Added beforeRepeat, afterRepeat, beforeUnRepeat, and AfterUnRepeat form triggers.
* Added a stylesheet with some default styles for repeater releated stuff.
* Added keypress event and tab index to add and remove buttons.
* Added a little bit of error handing to the javascript just in case the admin forgets to add a repeater-end or trys to nest repeaters.
* Repeater start field label now defaults to blank instead of "Untitled".

= 1.0.2 =
* Fixed bug where if any fields in a form with a repeater in it would be unsubmittable.
* Fixed repeater field validation.
* Added custom validation message feature.
* Added repeater "start" number feature.
* Added repeater label and description options.
* Added custom Add and Remove button HTML feature.
* Added "Do not use add and remove buttons" feature.
* Added new "[gfRepeater-count]" shortcode.

= 1.0.1 =
* Added support for Address, Checkboxes, Name, and Number fields.
* Added View details and GitHub links to row meta.
* Fixed input masks!

= 1.0.0 =
* Initial Release