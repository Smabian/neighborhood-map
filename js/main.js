var Locations = [
  {
    title: 'O´Donovan`s Irish Pub',
    location: {
      lat: 48.684770,
      lng: 9.014852}
  },{
    title: 'Hendl House',
    location: {
      lat: 48.683887,
      lng: 9.013464}
  },{
    title: 'Mercaden Store',
    location: {
      lat: 48.687687,
      lng: 9.006613}
  },{
    title: 'Hewlett Packard Enterprise',
    location: {
      lat: 48.6758462,
      lng: 8.9765623}
  },{
    title: 'Aldi Store',
    location: {
      lat: 48.67746,
      lng: 9.01241}
  },{
    title: 'Train Station',
    location: {
      lat: 48.687601,
      lng: 9.0047014}
  }
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
  this.hideInfoBox = ko.observable(false);

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

  //show or hide sidebar
  self.changeInfoBox = function(){
    if (self.hideInfoBox() === true){
      self.hideInfoBox(false);
    } else {
      self.hideInfoBox(true);
    }
  }

  for (i=0;i<Locations.length;i++){
    Locations[i].fsqData = loadFourSquareData(Locations[i]);
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

//Extend the boundaries of the map for each marker and display the marker
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// This function populates the infowindow when the marker is clicked
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content
    infowindow.setContent('');
    infowindow.marker = marker;
    var temp = Locations[marker.id].fsqData;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    infowindow.setContent('<div>' + marker.title + '</div><div class="infoArea">' +
      temp.Category + ' - Checkins: ' + temp.checkins + '</div><div>Click for next Image:</div><div>' +
      '<img id="infoImage" src="' + temp.photos[0] + '" alt="no pictures available">' +
      '<div id="copyright">©Information loaded from foursqare.com</div>');
    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
    // Let the marker bounce at the time the window is opened
    Bounce(marker);

    document.getElementById('infoImage').addEventListener("click", function (){
      this.src = temp.photos[i >= temp.photos.length - 1 ? i = 0 : ++i];
    }, false);
  }
}

//This function lets the marker bounce
function Bounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null); }, 1400);
}

ko.applyBindings(new ViewModel());

//______AJAX 3rd Party API - Foursquare_______
function loadFourSquareData(Location) {
  var foursquareKey = "&client_id=KU0OL2V23W3SCCXOOR0NO4STQVOHPBAWJVRQEXCX2V521RKZ&client_secret=43YDKHQ2BN2JDAW50R1CABJC4W2KSKTP4UGF1QNGLBY54NVS";
  var limit = "&limit=1";
  var date = function(){
    var today = new Date();
    //Get individual parts
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0
    var yyyy = today.getFullYear();
    //Fix formatting
    if(dd<10) {
        dd='0'+dd
    }
    if(mm<10) {
        mm='0'+mm
    }
    today = yyyy+''+mm+''+dd;
    return today;
  }();
  var ll= "ll=" + Location.location.lat + "," + Location.location.lng;
  var SearchUrl = "https://api.foursquare.com/v2/venues/search?" + ll + limit + foursquareKey + "&v=" + date;

  var fsqObj = {};

  $.ajax(SearchUrl, {
    dataType : "jsonp",
    success : function(data){
      fsqObj.checkins = data.response.venues[0].stats.checkinsCount;
      fsqObj.herenow = data.response.venues[0].hereNow.summary;
      fsqObj.Category = data.response.venues[0].categories[0].name;

      var searchVenue = data.response.venues[0];
      var photoURL = "https://api.foursquare.com/v2/venues/" + searchVenue.id + "/photos?" + foursquareKey + "&v=" + date

      $.ajax(photoURL, {
        dataType : "jsonp",
        success : function(photoData){
          var Temp = photoData.response.photos.items;
          fsqObj.photos = [];
          for(i=0;i<Temp.length;i++){
            fsqObj.photos[i] = Temp[i].prefix + "width300" + Temp[i].suffix;
          }
          if(Temp.length === 0) {
            fsqObj.photos[0] = "No picture available";
          }
        }
      });
    }
  })
  return fsqObj;
}






