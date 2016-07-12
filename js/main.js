// Model (Locations)
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

// Global Variables
var map;
var markers = [];

var Place = function(data,id){
  this.id = id;
  this.title = ko.observable(data.title);
  this.location = ko.observable(data.location);
}

var ViewModel = function(){
  var self = this;

  this.locationList = ko.observableArray([]); //Array of listentries
  this.query = ko.observable(''); //Observable for search
  this.sidebarVisible = ko.observable(false); //Sidebar Responsivness

  //Data-Binding Functions
  //Simulate click on Marker when selecting the matching list entry
  this.selectItem = function(){
    google.maps.event.trigger(markers[this.id], 'click');
  }
  //search function to update list
  self.search = function(value){
    // Clear List of all locations, prior to adding the matching locations
    self.locationList.removeAll();
    // run through locations and check if it matches the value entered in the search
    for(i=0;i<Locations.length;i++){
      if (Locations[i].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
        self.locationList.push(new Place(Locations[i],i));
        //Check if markers are loaded to update the map together with search
        if (markers.length != 0 ){
          markers[i].setVisible(true);
        }
      } else {
        markers[i].setVisible(false);
      }
    }
  }
  //Show/hide Sidebar when clicking burgermenu
  self.hideSidebar = function(){
    if (self.sidebarVisible() === true){
      self.sidebarVisible(false);
    } else {
      self.sidebarVisible(true);
    }
  }

  //Load data from Foursqare and add it to each object
  for (i=0;i<Locations.length;i++){
    Locations[i].fsqData = loadFourSquareData(Locations[i]);
  }
}
ko.applyBindings(new ViewModel());

//Google Map handling
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 48.682075, lng: 9.015431},
          zoom: 15,
          mapTypeControl: false,
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
    //Add Listener for Info Window
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });

    //Add Marker to map and scale
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
    var fsq = Locations[marker.id].fsqData;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    //Define content of Infowindow
    infowindow.setContent('<div class="infoArea"><h2>' + marker.title + '</h2>' +
      '<div>Type: ' + fsq.Category + ' - Checkins: ' + fsq.checkins + '</div>' +
      '<div class="smallText">Click for next Image:</div>' +
      '<div><img id="infoImage" src="' + fsq.photos[0] + '" alt="no pictures available">' +
      '<div id="copyright">©Information loaded from foursqare.com</div></div>');
    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
    // Let the marker bounce at the time the window is opened
    Bounce(marker);

    //Add Eventlistener to go through images on click
    document.getElementById('infoImage').addEventListener("click", function (){
      this.src = fsq.photos[i >= fsq.photos.length - 1 ? i = 0 : ++i];
    }, false);
  }
}

//This function lets the marker bounce
function Bounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function(){ marker.setAnimation(null); }, 1400); //Limit to 2 Bounces
}

//______AJAX 3rd Party API - Foursquare_______
function loadFourSquareData(Location) {
  //Define variables needed for request
  var fsqObj = {};
  var foursquareKey = "&client_id=KU0OL2V23W3SCCXOOR0NO4STQVOHPBAWJVRQEXCX2V521RKZ&client_secret=43YDKHQ2BN2JDAW50R1CABJC4W2KSKTP4UGF1QNGLBY54NVS";
  var limit = "&limit=1";
  //Get todays date as key
  var ll= "ll=" + Location.location.lat + "," + Location.location.lng;
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

  var SearchUrl = "https://api.foursquare.com/v2/venues/search?" + ll + limit + foursquareKey + "&v=" + date;
  //First Request for basic Info
  $.ajax(SearchUrl, {
    dataType : "jsonp",
    timeout: 5000,
    success : function(data){
      fsqObj.checkins = data.response.venues[0].stats.checkinsCount;
      fsqObj.herenow = data.response.venues[0].hereNow.summary;
      fsqObj.Category = data.response.venues[0].categories[0].name;

      //Define variables needed for second request
      var searchVenue = data.response.venues[0];

      var photoURL = "https://api.foursquare.com/v2/venues/" + searchVenue.id + "/photos?" + foursquareKey + "&v=" + date
      //Second Request for photos
      $.ajax(photoURL, {
        dataType : "jsonp",
        timeout: 5000,
        success : function(photoData){
          var Temp = photoData.response.photos.items;
          fsqObj.photos = [];
          for(i=0;i<Temp.length;i++){
            fsqObj.photos[i] = Temp[i].prefix + "width300" + Temp[i].suffix;
          }
          if(Temp.length === 0) {
            fsqObj.photos[0] = "img/NoImage.png";
          }
        }, error : function(xhr, textStatus, errorThrown){
           alert('Foresquare request failed - Infowindows not available');
        }
      });
    }, error : function(xhr, textStatus, errorThrown){
      alert('Foresquare request failed - Infowindows not available');
    }
  })
  return fsqObj;
}






