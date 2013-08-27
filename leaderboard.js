// Set up a collection to contain player information. On the server,

Images = new Meteor.Collection("images");

if (Meteor.isClient) {
  Meteor.startup(function() {
    Meteor.call("checkTwitter", function(error, results) {
        console.log(results.data); //results.data should be a JSON object
    });
    var isLocalhost = window.location.href.indexOf("localhost") !== -1;
    if(isLocalhost) {
      Accounts.loginServiceConfiguration.insert({
        service: "facebook",
        appId: "185552498194345",
        secret: "f236faea7e6523f136c3b0598a81694e"
      });
    } else {
      Accounts.loginServiceConfiguration.insert({
        service: "facebook",
        appId: "148296319947",
        secret: "fa00d13fdfa54d1973c5e5fd41c7cd88"
      });
    }
  });

  Template.leaderboard.images = function () {
    if(Meteor.user() != null)
      return Images.find({id : Meteor.user().services.facebook.id});
    else
      return null;
  };
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
  /*Accounts.loginServiceConfiguration.insert({
      service: "facebook",
      appId: "185552498194345",
      secret: "f236faea7e6523f136c3b0598a81694e"
  });*/
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
  var userid = user.services.facebook.id;
  for(var i=0; i<length-1; i++) {
    Images.insert({url: result.data.data[i].picture.data.url, id: userid});
  }
  if (options.profile)
    user.profile = options.profile;

  return user;
});
  Meteor.methods({
        checkTwitter: function () {
            this.unblock();
            var usr = Meteor.user();
            return Meteor.http.call("GET", "http://graph.facebook.com/zuck");
        }
    });
}
