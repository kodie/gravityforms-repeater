=== Gravity Forms Repeater Add-On ===
Contributors: KodieGrantham
Tags: gravityforms, gravity, forms, form, gravityforms, repeater, repeat, duplicate, duplication, field, fields
Requires at least: 3.9.0
Tested up to: 4.3.1
Stable tag: 1.0.6

A Gravity Forms add-on that allows specified groups of fields to be repeated by the user.

== Description ==
A Gravity Forms add-on that allows specified groups of fields to be repeated by the user.

= Supported Fields =
* Address
* Checkboxes
* Date
* Drop Down
* Email
* Hidden
* HTML
* MultiSelect
* Name
* Number
* Paragraph Text
* Phone
* Radio
* Section
* Single Line Text
* Time
* Website

= Features =
* Repeat groups of fields multiple times
* Use multiple repeaters on the same form
* Use shortcodes to display data to the user
* Use Javascript to manipulate the repeater (See GitHub Page)
* Customize the add and remove button's HTML
* Use Gravity Forms pre-populate hooks and filters like normal

= Issues =
* Not all fields are currently supported.
* Ajax enabled forms are not yet supported.
* Conditional Logic enabled fields are not yet supported.

= Shortcodes =
You can place shortcodes inside of input labels, input descriptions, and HTML blocks!

* [gfRepeater-count] - Will output the current repeat number.

= Check out the source on GitHub! =
<https://github.com/kodie/gravityforms-repeater>

== Installation ==
1. Upload the `repeater-add-on-for-gravity-forms` folder to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.

== Frequently Asked Questions ==
= Can I use multiple repeaters in one form? =
Yes!

= Can I nest repeaters? =
Unfortunately nesting repeaters is not supported at this time.

= Can I change the `+` and `-` buttons to text links? =
Yes! Just go to the form editor and change the `Add HTML` and `Remove HTML` settings to `<a>Your Link Text</a>` and they should appear as regular links on your form!

== Screenshots ==
1. Any supported fields placed between the `Repeater` and `Repeater End` will be repeated.
2. A minimum and maximum number may be set to limit how many times a Repeater can be repeated.
3. When activated, 2 new field type buttons will be added to Gravity Forms, `Repeater` and `Repeater End`.
4. A view of the front-end. The only visible difference will be the added `+` and `-` buttons.

== Changelog ==
= 1.0.6 =
* Fixed repeater 'start' setting. (Apparently it's been broken for awhile?)
* Fixed datepicker ui for repeated date fields.
* Fixed bug where repeater plugin wouldn't allow page settings to display in the form editor.
* Fixed entry detail formatting for emails and non-html views.
* Repeated field labels are no longer saved in the database with the entries and are now looked up by field ID.
* Added support for Hidden field type.
* Added the ability to change the repeater 'start' setting by using the built in Gravity Froms pre-populate filters and hooks.
* Added the ability to pre-populate repeated fields using the built in Gravity Forms filters and hooks. (See readme for more info)
* Field ID number is now stored in gfRepeaters data. (gfRepeaters[repeaterId]['children'][childId]['idNum'])
* Field input pre-populate value is now stored in GfRepeaters data. (gfRepeaters[repeaterId]['children'][childId]['inputs'][inputId]['prePopulate']) (See readme for more info)
* Plugin now requires Gravity Forms 1.9 or later.

= 1.0.5 =
* Fixed bug where sometimes not all repeated, required fields would be validated.
* Fixed bug where repeated fields that are set to 'adminOnly' would have that setting switched off upon form validation.
* Added support for MultiSelect, Radio, and Time fields.
* Added upgrade function to clean up entries from older versions.
* Repeater field admin label now defaults to 'Repeater' instead of blank.
* All repeated values are now stored as arrays besides special cases such as Section fields.
* Field types are now stored in gfRepeaters data. (gfRepeaters[repeaterId]['children'][childId]['type'])
* Name and Address fields now only require the normally required fields.
* Added plugin page link to row meta.
* A few misc things and code clean up.

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