var Locations = [
  {title: 'O´Donovan`s Irish Pub', location: {lat: 48.6847732, lng: 9.0126629}},
  {title: 'Movie Theater', location: {lat: 48.6840791, lng: 9.0119977}},
  {title: 'Mercaden Store', location: {lat: 48.6871319, lng: 9.0060003}},
  {title: 'Hewlett Packard Enterprise', location: {lat: 48.6840538, lng: 8.9693227}},
  {title: 'Lidl Store', location: {lat: 48.6782971, lng: 9.0117677}},
  {title: 'Train Station', location: {lat: 48.688063, lng: 9.0043825}}
]

var Place = function(data){
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
}

var ViewModel = function(){
  var self = this;

  this.locationList = ko.observableArray([]);
  this.query = ko.observable('');

  // Initial Load of list
  Locations.forEach(function(locationItem){
    self.locationList.push(new Place(locationItem));
  });

  // search function to update list
  self.search = function(value){
    // Clear List
    self.locationList.removeAll();
    // run through locations and check if it matches the value entered in the search
    for(i=0;i<Locations.length;i++){
      if (Locations[i].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        self.locationList.push(new Place(Locations[i]));
      }
    }
  }
}

ko.applyBindings(new ViewModel());


var map;
var markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 48.682075, lng: 9.015431},
          zoom: 15,
        });

  for (var i = 0; i < Locations.length; i++) {
    // Get the position from the location array.
    var position = Locations[i].location;
    var title = Locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    markers.push(marker);
    // Two event listeners - one for mouseover, one for mouseout
    showListings();
  }
}

function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}
