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
* Name
* Number
* Paragraph Text
* Phone
* Single Line Text
* Website

### Issues
* Not all fields are currently supported.
* Fields inside of a repeater will return a duplicated item with a blank result outside of the repeater when viewing an indiviual entry (These are only visible if "show empty fields" is checked).
* Fields inside of a repeater sometimes show a blank colum in the "entries" page. (These can be hidden by changing which columns to display by clicking the gear icon in the upper right-hand corner).

### Frequently Asked Questions
##### Can I use multiple repeaters in one form?
Yes!

### Version
1.0.1

### Changelog
##### 1.0.1
* Added support for Address, Checkboxes, Name, and Number fields.
* Added View details and GitHub links to row meta.
* Fixed input masks!

### Requirements
* Wordpress (duh)
* Gravity Forms (duh)

### Installation
1. Upload the `gravityforms-repeater` folder to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.