// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");
Images = new Meteor.Collection("images");

if (Meteor.isClient) {
  Meteor.startup(function() {
    Meteor.call("checkTwitter", function(error, results) {
        console.log(results.data); //results.data should be a JSON object
    });
  });
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.images = function () {
    return Images.find({});
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
  Accounts.loginServiceConfiguration.remove({
    service: "facebook"
  });
  Accounts.loginServiceConfiguration.insert({
      service: "facebook",
      appId: "185552498194345",
      secret: "f236faea7e6523f136c3b0598a81694e"
  });
  Accounts.onCreateUser(function (options, user) {
  var accessToken = user.services.facebook.accessToken,
      profile;

  result = Meteor.http.get("https://graph.facebook.com/me/friends?fields=picture,name", {
    params: {
      access_token: accessToken
    }
  });
  var length = result.data.data.length;
  console.log(length);
  var userid = Meteor.userId();
  for(var i=0; i<length-1; i++) {
    Images.insert({url: result.data.data[i].picture.data.url, id: userid});
    console.log(result.data.data[i].picture.data.url);
  }
  if (options.profile)
    user.profile = options.profile;
  return user;
});
  Meteor.methods({
        checkTwitter: function () {
            this.unblock();
            console.log("testtting");
            return Meteor.http.call("GET", "http://graph.facebook.com/joshua.hargreaves");
        }
    });
}
