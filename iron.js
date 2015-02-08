
Maps = new Mongo.Collection('maps');

Points = new Mongo.Collection('points');


Router.configure({
  layoutTemplate: 'layout',
  waitOn: function () { return Meteor.subscribe('maps'); }
});

Router.route('/', { name: 'main'});

Router.route('/maps/:_id', { 
  name: 'map',
  data: function () { 

    Session.set('thisId', this.params._id);
    return Maps.findOne(this.params._id); }
});


if (Meteor.isClient) {

  Meteor.subscribe('maps');
  Meteor.subscribe('points');

  Template.layout.events({

    
  });

  Template.main.helpers({
    posts: function () {
      return Maps.find();
    }
  });

  Template.main.events({
    'submit form': function () {
      event.preventDefault();

      var titleVar = event.target.title.value;
      var subVar = event.target.sub.value;

      if (titleVar) {
        Maps.insert({
          title: titleVar,
          sub: subVar
        });
      } else {
        alert('please enter a title');
      }
    },

    'click .addMap': function () {

      if (document.getElementById("moreBarMap").style.display === 'none') {
        document.getElementById("moreBarMap").style.display = 'block';
      } else {
        document.getElementById("moreBarMap").style.display = 'none';
      }
    }
  });

  Template.map.rendered = function () {
    

    map = L.map('map');



    map.setView([0.505, 20.09], 4);


    console.log(map.getCenter());

    
    



    L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
        // attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }).addTo(map);

    for (var i=0; i < Points.find().count(); i++) {
      if (Points.find().fetch()[i].mapId == Session.get('thisId')) {

        L.marker([Points.find().fetch()[i].xcoord,Points.find().fetch()[i].ycoord]).addTo(map).bindPopup(Points.find().fetch()[i].title);

      } else {
      }
    }
  };

  Template.map.helpers({
    typeOfPage: function () {
      return "mapPage";
    }
  });

  Template.map.events({
    'submit form': function (event) {
      event.preventDefault();

      var xcoordVar = event.target.xcoordin.value;
      var ycoordVar = event.target.ycoordin.value;
      var titleVar = event.target.pointTitle.value;
      var mapIdVar = Session.get('thisId');

      if (xcoordVar && ycoordVar) {
        if (xcoordVar <= 180 && xcoordVar >= -180) {
          if (ycoordVar <= 180 && ycoordVar >= -180) {
            Points.insert({
              xcoord: xcoordVar,
              ycoord: ycoordVar,
              title: titleVar,
              mapId: mapIdVar
            });

            L.marker([xcoordVar, ycoordVar]).addTo(map).bindPopup(titleVar);
          } else {
            alert('please enter a valid y coordinate between -180 and 180');
          } 
        } else {
          alert('please enter a valid x coordinate between -180 and 180');
        }
      } else {
        alert('please enter valid coordinates between -180 and 180');
      }
       
    },

    'click .findMe': function () {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
          console.log(position.coords.latitude);
          map.setView([position.coords.latitude , position.coords.longitude], 13);
        });
      } else {
        alert('your browser doesnt support geolocation');
      }
    },

    'click .addPoint': function () {

      if (document.getElementById("moreBarPoint").style.display === 'none') {
        document.getElementById("moreBarPoint").style.display = 'block';
      } else {
        document.getElementById("moreBarPoint").style.display = 'none';
      }
    },

    'click #map': function () {
      
      map.on('click', function(e) {
        document.getElementById('xcoord').value = e.latlng.lat;
        document.getElementById('ycoord').value = e.latlng.lng;
      });
    }
  });


}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Meteor.publish('maps', function() {
      return Maps.find();
    });

    Meteor.publish('points', function() {
      return Points.find();
    });
  });

}
