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

### Features
* Repeat groups of fields multiple times
* Use multiple repeaters on the same form
* Use shortcodes to display data to the user
* Use Javascript to manipulate the repeater
* Customize the add and remove button's HTML
* Use Gravity Forms pre-populate hooks and filters like normal

### Issues
* Not all fields are currently supported.
* Ajax enabled forms are not yet supported. (Ajax will be automatically disabled on forms with repeaters)
* Conditional Logic enabled fields are not yet supported.

### Shortcodes
You can place shortcodes inside of input labels, input descriptions, and HTML blocks!
* [gfRepeater-count] - Will output the current repeat number.

### Javascript
##### Functions
You can use Javascript to manipulate the repeater.
* formId is your form's Id number assigned by Gravity Forms.
* repeaterId will depened on how many repeaters you have in your form. (The first repeater's ID is 1, second is 2, etc.)
* repeaterChildId works the same way and depends on how many times the repeater has been repeated.
* These functions will not allow you to repeat more than the set max and unrepeat more than the set min.
#
```
gfRepeater_repeatRepeater(formId, repeaterId);
  Repeats the repeater once.
```
```
gfRepeater_unrepeatRepeater(formId, repeaterId, repeaterChildId);
  Un-repeats the repeater once. repeaterChildId is optional.
```
```
gfRepeater_repeatRepeaterTimes(formId, repeaterId, timesX);
  Repeats the repeater a number of times.
```
```
gfRepeater_unrepeatRepeaterTimes(formId, repeaterId, timesX);
  UnRepeats the repeater a number of times.
```
```
gfRepeater_setRepeater(formId, repeaterId, timesX);
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
[formId]
    [repeaterId]
        ['data'] - Contains different data to keep track of.
            ['repeatCount'] - The number of times the repeater has been repeated.
            ['prevRepeatCount'] - If the form has already been submitted and failed validation, this will contain the repeatCount from before the from was submitted, otherwise it will be null.
            ['childrenCount'] - The number of children fields that get cloned everytime the repeater is repeated.
            ['paremCount'] - The highest field ID that has had their prepopulate paremeter set.
            ['tabIndex'] - The tabindex that was assigned to the repeater start field and will be assigned to all children.
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
                ['idNum'] - The field ID number.
                ['inputCount'] - The number of inputs the child contains.
                ['required'] - True or False depeneding on if the field is required or not.
                ['type'] - The field type.
                ['inputs'] - Contains all of the inputs that the child contains.
                    [inputId]
                        ['element'] - The input element.
                        ['id'] - The input HTML id.
                        ['name'] - The input name.
                        ['defaultValue'] - The default value for the input.
                        ['prePopulate'] - Array containing prepopulate values.
```

##### Usage Examples
Repeat the repeater a number of times depending on the value of a drop down field:
```
jQuery('#gform_6 #input_6_7').change(function(){
    var attendees = jQuery(this).val();
    gfRepeater_setRepeater(6, 1, attendees);
});
```

Change the value of a field if the repeater is repeated or un-repeated:
```
jQuery('#gform_9').on('afterRepeat afterUnRepeat', function(event, repeaterId, repeaterChildId){
    if (repeaterId == 1) {
        var repeatCount = gfRepeater_repeaters[9][1]['data']['repeatCount'];
        var totalPrice = 27.47 * repeatCount;
        jQuery('#gform_9 #input_9_4').val('$'+totalPrice);
    }
});
```


### Prepopulate Fields
You can set Parameter Names to prepopulate repeated fields like usual with the added ability to specify which repeated set will be prepopulated. For example, let's say we have set the parameter name for one of our repeated fields to "parem":

`?parem=hello+world` will result in that field being set to "hello world" regardless of how many times it has been repeated.

`?parem3=hello+world` will result in that field being set to "hello world" only when repeated a third time.

You can use filters as well!

```
add_filter( 'gform_field_value_parem', 'your_function_name' );
```

```
add_filter( 'gform_field_value_parem3', 'your_function_name' );
```

Also, setting the prepopulate parameter on the repeater start field will override the `start` setting.


### Frequently Asked Questions
##### Can I use multiple repeaters in one form?
Yes!

##### Can I nest repeaters?
Unfortunately nesting repeaters is not supported at this time.

##### Can I change the `+` and `-` buttons to text links?
Yes! Just go to the form editor and change the `Add HTML` and `Remove HTML` settings to `<a>Your Link Text</a>` and they should appear as regular links on your form!

### Development
It is possible to use the development version of this plugin in your Wordpress install and keep it updated with [Andy Fragen](https://github.com/afragen)'s [GitHub Updater](https://github.com/afragen/github-updater)!

1. Download & Install [GitHub Updater](https://github.com/afragen/github-updater).
1. Go to Settings -> GitHub Updater
1. Enable Branch Switching
1. Go to Plugins
1. Select "try another branch" under Gravity Forms Repeater Add-On.
1. Select "development".

and that's it! You will recieve the latest development versions of this plugin!

**Warning: There is a slight possibility that development versions are unstable. Use at your own risk.**

### Version
1.0.7

### Changelog
##### 1.0.7
* Fixed bug where field order was not saved when a form was submitted.
* Fixed syntax error for older versions of PHP.
* Repeated fields now have their tabindex set to the one that was assigned to the repeater start field.
* Repeater start field tabindex now stored in gfRepeaters data. (gfRepeaters[repeaterId]['data']['tabIndex'])
* Repeater is now repeated if a paremeter is set for a specific field that is higher than the start repeat count.
* Highest set paremeter number is now stored in gfRepeaters data. (gfRepeaters[repeaterId]['data']['paremCount'])
* Repeater dependencies, actions, and filters are now only loaded on forms that have a repeater field.
* Field type is now set for hidden and section fields in gfRepeaters data.
* Ajax is now automatically disabled on forms that have a repeater field. (Until I come up with a fix for ajax enabled forms)
* Added support for Andy Fragen's GitHub Updater. (See readme for more info)
* gfRepeaters data now contains the form ID number as a root and the repeater Id as a subroot. (See readme for more info)

### Requirements
* Wordpress 3.9 or later
* Gravity Forms 1.9 or later

### Installation
1. Upload the `repeater-add-on-for-gravity-forms` folder to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.