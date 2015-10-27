=== Gravity Forms Repeater Add-On ===
Contributors: KodieGrantham
Tags: gravity, forms, repeater
Requires at least: 3.0.1
Tested up to: 4.3.1
Stable tag: 1.0.2

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
* Use Javascript to manipulate the repeater
* Customize the add and remove button's HTML

= Issues =
* Not all fields are currently supported.
* Fields inside of a repeater will return a duplicated item with a blank result outside of the repeater when viewing an indiviual entry (These are only visible if "show empty fields" is checked).
* Fields inside of a repeater sometimes show a blank colum in the "entries" page. (These can be hidden by changing which columns to display by clicking the gear icon in the upper right-hand corner).

= Shortcodes =
You can place shortcodes inside of input labels, input descriptions, and HTML blocks!
* [gfRepeater-count] - Will output the current repeat number.

= Check out the source on GitHub! =
<https://github.com/kodie/gravityforms-repeater>

== Javascript ==
= Functions =
You can use Javascript to manipulate the repeater.
* repeaterId will depened on how many repeaters you have in your form. (The first repeater's ID is 1, second is 2, etc.)
* repeaterChildId works the same way and depends on how many times the repeater has been repeated.
* These functions will not allow you to repeat more than the set max and unrepeat more than the set min.
#
```
gfRepeater_repeatRepeater(repeaterId);
  Repeats the repeater once.
```
```
gfRepeater_unrepeatRepeater(repeaterId, repeaterChildId);
  Un-repeats the repeater once. repeaterChildId is optional.
```
```
gfRepeater_repeatRepeaterTimes(repeaterId, timesX);
  Repeats the repeater a number of times.
```
```
gfRepeater_unrepeatRepeaterTimes(repeaterId, timesX);
  UnRepeats the repeater a number of times.
```
```
gfRepeater_setRepeater(repeaterId, timesX);
  Repeats or unrepeats the repeater to get it to whatever timesX is.
```

= Information =
You can access all repeater information using the object `gfRepeater_repeaters`.
```
gfRepeater_repeaters
[repeaterId]
    ['data'] - Contains different data to keep track of.
        ['repeatCount'] - The number of times the repeater has been repeated.
        ['prevRepeatCount'] - If the form has already been submitted and failed validation, this will contain the repeatCount from before the from was submitted, otherwise it will be null.
        ['childrenCount'] - The number of children fields that get cloned everytime the repeater is repeated.
        ['inputData'] - Contains an array with all of the input names in the repeater.
    ['settings'] - Contains the different settings that are set in the form editor.
        ['start'] - The number of times the repeater should be repeated when the form is loaded.
        ['min'] - The minimum number of times the repeater can be repeated.
        ['max'] - The maximum number of times the repeater can be repeated.
    ['controllers'] - Contains different elements that I like to call controllers.
        ['add'] - The add button.
        ['remove'] - The remove button.
        ['data'] - The hidden element that stores data to be passed to PHP.
        ['start'] - The start of the repeater.
        ['end'] - The end of the repeater.
    ['children'] - Contains the children fields that get cloned everytime the repeater is repeated.
        [childId]
            ['element'] - The field element.
            ['id'] - The field HTML id.
            ['inputCount'] - The number of inputs the child contains.
            ['required'] - True or False depeneding on if the field is required or not.
            ['inputs'] - Contains all of the inputs that the child contains.
                [inputId]
                    ['element'] - The input element.
                    ['id'] - The input HTML id.
                    ['name'] - The input name.
                    ['defaultValue'] - The default value for the input.
```

== Installation ==
1. Upload the `gravityforms-repeater` folder to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.

== Frequently Asked Questions ==
= Can I use multiple repeaters in one form? =
Yes!

= Some of my repeated fields are showing they are required when they shouldn't be! What do I do?
If you experience any problems with required fields, follow the following steps for the field:
1. Uncheck the "Required" checkbox for the field.
1. Move the field outside of the repeater.
1. Make sure that the "Required" checkbox is still unchecked. If it's checked again, uncheck it.
1. Move the field back inside of the repeater.
1. If desired, make the field required again.

== Screenshots ==
1. Any supported fields placed between the `Repeater` and `Repeater End` will be repeated.
2. A minimum and maximum number may be set to limit how many times a Repeater can be repeated.
3. When activated, 2 new field type buttons will be added to Gravity Forms, `Repeater` and `Repeater End`.
4. A view of the front-end. The only visible difference will be the added `+` and `-` buttons.

== Changelog ==
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