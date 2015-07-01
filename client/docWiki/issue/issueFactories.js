var app = angular.module('isa.docwiki.reissue.factories', []);

/*
 * Factory for Document Issues (amendments)
 *
 * @author Mark Leusink
 */
app.factory('IssueFactory', [ '$rootScope', '$injector', function($rootScope, $injector) {
  return $injector.get($rootScope.online ? '_IssueRemote' : '_IssueLocal');
}]);

app.factory('_IssueRemote', ['DocumentIssue', function(DocumentIssue) {
  return {

    all : function(documentId) {
      return DocumentIssue.find(
        { filter: { where: { documentId : documentId }, order : "issueNo ASC" } },
        function(list) { },
        function(errorResponse) {
          console.error(errorResponse);
        }
      );
    },

    findById: function(id) {
      return DocumentIssue.findById( { id: id });
    },

    create: function(entity) {
      return DocumentIssue.create(entity).$promise;
    },

    delete: function(id) {
      return DocumentIssue.delete( { id : id } ).$promise;
    },

    save: function(entity) {
      var entity = new DocumentIssue(entity);
      return entity.$save();
    }

  };

}]);

app.factory('_IssueLocal', ['$lowla', '$lowlaDocument', function($lowla, $lowlaDocument) {
  var issues = $lowla.collection('db', 'Issue');

  return {
    all : function(parentId, scope) {
      return $lowlaArray(issues.find({documentId: documentId}), scope);
    },

    findById: function(id, scope) {
      return $lowlaDocument(issues.find({id: id}), scope);
    },

    create: function(issue) {
      return $lowlaDefer(issues.insert(issue));
    },

    delete: function(id) {
      return $lowlaDefer(issues.remove({id: id}));
    },

    save: function(issue) {
      return $lowlaDefer(issues.findAndModify({ id: issue.id }, issue));
    }
  };
}]);
