![](/assets/icon-256x256.png?raw=true)
# Gravity Forms Repeater Add-On
A Gravity Forms add-on that allows specified groups of fields to be repeated by the user.
<https://wordpress.org/plugins/repeater-add-on-for-gravity-forms/>

### Supported Fields
* Date
* Drop Down
* Email
* Paragraph Text
* Phone
* Single Line Text
* Website

(Hoping to add more to this list very soon!)

### Issues
* Not all fields are currently supported. Mostly just fields that return multiple results (checkboxes, lists, etc.).
* Fields inside of a repeater will return a duplicated item with a blank result outside of the repeat when viewing an indiviual entry (These are only visible if "show empty fields" is checked).
* Fields inside of a repeater sometimes show a blank colum in the "entries" page. (These can be hidden by changing which columns to display by clicking the gear icon in the upper right-hand corner).
* Fields inside of a repeater are not able to use Input Masks.

### Version
1.0.0

### Changelog
##### 1.0.0
* Initial Release

### Requirements
* Wordpress (duh)
* Gravity Forms (duh)

### Installation
1. Upload the `gravityforms-repeater` folder to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.