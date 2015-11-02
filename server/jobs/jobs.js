

SyncedCron.add({
  name: 'Crunch some important numbers for the marketing department',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 20 seconds');
  }, 
  job: function(intendedAt) {
    console.log('crunching numbers');
    console.log('job should be running at:');
    console.log(intendedAt);
  }
});

Meteor.startup(function () {
  // code to run on server at startup
  SyncedCron.start();
  
  // Stop jobs after 15 seconds
  Meteor.setTimeout(function() { SyncedCron.stop(); }, 15 * 1000);
});