Meteor.publish('workbook-activities', function(workbookId) {
  return WorkbookActivities.find({ moduleId: workbookId });
});
