# Google Maps Helper

Google Maps Helper is small package that simplifies the Google Maps Javascript API integration process. Drop in your API key, adjust settings and worry no more!

## Installation

Use NPM
```console
$ npm install @kluseg/googlemaps-helper
```

Or clone this repo and include minified script in your HTML:

```html
<script type="text/javscript" src="googlemaps-helper.min.js">
```

## Usage and configuration

```javascript
var map = new GoogleMapsHelper(document.querySelector('#map'), options);

function your_callback_function() {
	return map.init();
}
```

#### What happens next?
The library loads the google's javascript file and sets map based on your config.

```javascript
var options = {
	center: // <string> - This address would be geocoded,
	fallbackZoom: // <int> - Initial map zoom (just in case something goes wrong),
	google: {
		callback: // <string> - Name of callback function the Google's script should call,
		key: // <string|null> - Your API key,
		language: // <string> - ex. 'en',
		region: // <string> - ex. 'US',
		url: // <string> - Google API endpoint, 'https://maps.googleapis.com/maps/api/js',
	},
	infoWindow: // <string> - Template for markers window,
	iniDelay: // <int> - Determines how long script should wait before initialization (in miliseconds),
	markers: // <array> - Array of objects (markers data),
	maxZoom: // <int> - Max map zoom,
	minZoom: // <int> - Min map zoom,
	on: {
		initialized: // <function> - Function to call when script initializes, 
		markerCreated: // <function> - Function to call when marker has been created. Passes marker object as an argument,
		markerSpawned: // <function> - Function to call when marker has been added to map. Passes marker object as an argument,
	},
	throttle: {
		apply: // <bool> - Determines if throttling should be applied,
		rate: // <int> - Time between API calls (in miliseconds),
	},
}
```

#### Waaait a minute. Template? Markers?

Yup. You can define set of markers you want to display and attach Info Windows to them. It goes like this.

```javascript
var markers = [
	{
		geocode: // <string> - If 'lat' or 'lng' is not provided this address would be geocoded,
		lat: // <double> - Latitude of marker (optional),
		lng: // <double> - Longtitude of marker (optional),
		title: // <string> - The title that would appear on hover,
		icon: // <string> - URL to marker image,
		custom_property: // <any> - Tou can provide as much custom properties as you want, would be helpful later
	},
	{
		...
	},
];
```

So. We got our markers. Let's create some Info Windows. This library includes tiny "templating engine" so you can display your marker's properties.

```javascript
var template = 
	'<div class="row">' +
		'<p>{{custom_property}}</p>' +
		'<p>{{another_custom_property}}</p>' +
	'</div>';
```

The complete configuration could look like this:

#### Minimal

```html
<script type="text/javscript" src="googlemaps-helper.min.js">
```
```javascript
var map = new GoogleMapsHelper(document.querySelector('#map'), {
	center: 'Warsaw, Poland',
	google: {
		key: 'YOUR_API_KEY',
	},
});

function initMap() {
	return map.init();
}
```

#### Complete

```html
<script type="text/javscript" src="googlemaps-helper.min.js">
```
```javascript
var template = 
	'<div class="row">' +
		'<p class="big">{{title}}</p>' +
		'<p class="small">Clients: {{clients_count}}</p>' +
		'<img class="img-thumb" src="{{thumbnail}}">' +
	'</div>';

var markers = [
	{
		geocode: 'Plac Artura Zawiszy, Warsaw, Poland',
		title: 'Marketplace #1',
		icon: 'http://fancy-markers.tld/fancy.png',
		clients_count: 123,
		thumbnail: 'http://my-domain.tld/marketplaces/1/thumb.png',
	},
];

var options = {
	center: 'Warsaw, Poland',
	fallbackZoom: 6 // default  = 6,
	google: {
		callback: 'mapInit' // default = initMap,
		key: 'YOUR_API_KEY',
		language: 'en' // default = en,
		region: 'US' // default = US,
		url: 'https://maps.googleapis.com/maps/api/js' // default = https://maps.googleapis.com/maps/api/js,
	},
	infoWindow: template,
	iniDelay: 100 // default = 500,
	markers: markers,
	maxZoom: 21 // default = 21,
	minZoom: 1 // default = 1,
	on: {
		initialized: function() { alert('Map is ready!'); }, 
		markerCreated: function(marker) { alert('Just geocoded this marker: '+ marker.title); },
		markerSpawned: function(marker) { alert('Just appended this marker: '+ marker.title); }
	},
	throttle: {
		apply: true // default = true,
		rate: 500 // default = 50,
	},
}

var map = new GoogleMapsHelper(document.querySelector('#map'), options);

function mapInit() {
	return map.init();
}
```

Done!

## But why?

I found myself tired of repeating the same integration process over and over again, that's why. Hope you'll find it useful.

## Future plans

1. Theming options

If you have any ideas... You know what to do :)