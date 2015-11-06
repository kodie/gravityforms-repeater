![](/assets/icon-256x256.png?raw=true)
# Gravity Forms Repeater Add-On
A Gravity Forms add-on that allows specified groups of fields to be repeated by the user.
<https://wordpress.org/plugins/repeater-add-on-for-gravity-forms/>

### Supported Fields
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

### Features
* Repeat groups of fields multiple times
* Use multiple repeaters on the same form
* Use shortcodes to display data to the user
* Use Javascript to manipulate the repeater
* Customize the add and remove button's HTML

### Issues
* Not all fields are currently supported.
* Ajax enabled forms are not supported.
* Fields inside of a repeater will return a duplicated item with a blank result outside of the repeater when viewing an indiviual entry (These are only visible if "show empty fields" is checked).
* Fields inside of a repeater sometimes show a blank colum in the "entries" page. (These can be hidden by changing which columns to display by clicking the gear icon in the upper right-hand corner).

### Shortcodes
You can place shortcodes inside of input labels, input descriptions, and HTML blocks!
* [gfRepeater-count] - Will output the current repeat number.

### Javascript
##### Functions
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

##### Triggers
These triggers are assigned to the form will be fired during different repeater related events with the repeaterId and repeaterChildId attached to them.
```
beforeRepeat - Fires right before a repeater is about to be repeated.
afterRepeat - Fires right after a repeater has been repeated.
beforeUnRepeat - Fires right before a repeater is about to be un-repeated.
afterUnRepeat - Fires right after a repeater has been un-repeated.
```

##### Information
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

##### Usage Examples
Repeat the repeater a number of times depending on the value of a drop down field:
```
jQuery('#gform_6 #input_6_7').change(function(){
    var attendees = jQuery(this).val();
    gfRepeater_setRepeater(1, attendees);
});
```

Change the value of a field if the repeater is repeated or un-repeated:
```
jQuery('#gform_9').on('afterRepeat afterUnRepeat', function(event, repeaterId, repeaterChildId){
    if (repeaterId == 1) {
        var repeatCount = gfRepeater_repeaters[repeaterId]['data']['repeatCount'];
        var totalPrice = 27.47 * repeatCount;
        jQuery('#gform_9 #input_9_4').val('$'+totalPrice);
    }
});
```


### Frequently Asked Questions
##### Can I use multiple repeaters in one form?
Yes!

##### Can I nest repeaters?
Unfortunately nesting repeaters is not supported at this time.

### Version
1.0.4

### Changelog
##### 1.0.4
* Fixed bug with number field where a PHP error would show up if a form failed validation.
* Fixed bug where a javascript error would occur if no repeater children were marked as required.
* Fixed bug where a PHP error would sometimes occur on the entries page in the admin panel if a repeated field was submitted blank.
* Added support for Section field type.
* Default validation functions are now bypassed for repeater children.
* gfRepeater-count shortcode now shows up for field titles on the entires page in the admin panel.
* Blank repeated fields now show up if "Show Empty Fields" is enabled.
* Repeater children and repeater end fields no longer display duplicated results on the entries page in the admin panel.
* Added a little bit of backwards compatibility for fetching saved repeater child entry data.

### Requirements
* Wordpress (duh)
* Gravity Forms (duh)

### Installation
1. Upload the `gravityforms-repeater` folder to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.