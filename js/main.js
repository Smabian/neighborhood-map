var initialLocations = [
  {title: 'O´Donovan`s Irish Pub', location: {lat: 48.6847732, lng: 9.0126629}},
  {title: 'Movie Theater', location: {lat: 48.6840791, lng: 9.0119977}},
  {title: 'Mercaden Shopping', location: {lat: 48.6871319, lng: 9.0060003}},
  {title: 'Hewlett Packard Enterprise', location: {lat: 48.6840538, lng: 8.9693227}},
  {title: 'Lidl', location: {lat: 48.6782971, lng: 9.0117677}},
  {title: 'Train Station', location: {lat: 48.688063, lng: 9.0043825}}
]



var ViewModel = function(){
  var self = this;

}
ko.applyBindings(new ViewModel());


//Temporary Code:
var map;
// Create a new blank array for all the listing markers.
var markers = [];
// This global polygon variable is to ensure only ONE polygon is rendered.
var polygon = null;
// Create placemarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 48.682075, lng: 9.015431},
          zoom: 15,
        });
}


