var Locations = [
  {title: 'O´Donovan`s Irish Pub', location: {lat: 48.684770, lng: 9.014852}},
  {title: 'Movie Theater', location: {lat: 48.683887, lng: 9.013464}},
  {title: 'Mercaden Store', location: {lat: 48.687687, lng: 9.006613}},
  {title: 'Hewlett Packard Enterprise', location: {lat: 48.6758462, lng: 8.9765623}},
  {title: 'Lidl Store', location: {lat: 48.67854, lng: 9.0125401}},
  {title: 'Train Station', location: {lat: 48.687601, lng: 9.0047014}}
]

var map;
var markers = [];

var Place = function(data,id){
  this.id = id;
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
}

var ViewModel = function(){
  var self = this;

  this.locationList = ko.observableArray([]);
  this.query = ko.observable('');

  this.selectItem = function(){
    google.maps.event.trigger(markers[this.id], 'click');
  }

  // search function to update list
  self.search = function(value){
    // Clear List
    self.locationList.removeAll();
    // run through locations and check if it matches the value entered in the search
    for(i=0;i<Locations.length;i++){
      if (Locations[i].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        self.locationList.push(new Place(Locations[i],i));
        //Check if markers are loaded (array not empty)
        if (markers.length != 0 ){
          markers[i].setVisible(true);
        }
      } else {
        markers[i].setVisible(false);
      }
    }
  }
}

//Google Map handling
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 48.682075, lng: 9.015431},
          zoom: 15,
        });

  var largeInfowindow = new google.maps.InfoWindow();

  for (var i = 0; i < Locations.length; i++) {
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
    //Add Info Window
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    //Add Marker and scale map
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

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    infowindow.setContent('<div>' + marker.title + '</div>');
    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
    Bounce(marker);
  }
}

function Bounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null); }, 1400);
}

ko.applyBindings(new ViewModel());
