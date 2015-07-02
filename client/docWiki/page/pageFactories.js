var app = angular.module('isa.docwiki');

app.factory('PageFactory', [ '$rootScope', '$injector', function($rootScope, $injector) {

	if ($rootScope.online) {
		return $injector.get('_PageRemote');
	} else {
		return $injector.get('_PageLocal');
	}

}]);

app.factory('_PageRemote', [ 'Page', function(Page) {

	return {

		/* return a list of all pages belonging to a single document
  		 * we're using a scope (see page.js model) here to return only
  		 * current version pages (currentVersion=true)
		  */
		all : function(documentId) {

			return Page.__get__current(
			  { filter: { where: { documentId : documentId }, order : 'section ASC' } },
			  function(list) { },
			  function(errorResponse) {
			  	console.error(errorResponse);
			  }
      		);

		},

	    findById: function(id) {
	      return Page.findById( { id: id });
	    },

		/*
		 * Return a list of all pages from a docwiki
		 * in which the specified tag is used
		 * This function uses the remote getCurrent method to only retrieve 'current' pages (not older versions)
		 */
		byTag : function(documentId, tag) {

			return Page.__get__current(
			  { filter: {
			  	where : {
			  		and : [
			  			{ documentId : documentId },
			  			{ tags : {inq : [tag] } }
			  		]
			  	},
			  	order : 'section ASC' }
			  },
			  function(list) { },
			  function(errorResponse) {
			  	console.error(errorResponse);
			  }
			);

		},

	    create: function(page) {
	      return Page.create(page).$promise;
	    },

	    delete: function(id) {
	      return Page.delete( { id : id } ).$promise;
	    },

	    save: function(page) {

	    	console.log('saving a page', page);

	      var page = new Page(page);
	      return page.$save();
	    },

	    update : function(id, attrs) {
	    	//update specifc properties only
	    	return Page.prototype$updateAttributes({ id: id }, attrs)
  				.$promise;
	    }
	};

}]);

app.factory('_PageLocal', [ '$lowla', '$lowlaArray', '$lowlaDocument', '$lowlaDefer', function($lowla, $lowlaArray, $lowlaDocument, $lowlaDefer) {
  var pages = $lowla.collection('db', 'Page');

	return {

		all : function(documentId, scope) {
      		return $lowlaArray(pages.find({documentId: documentId, currentVersion: true}, ['section', 1]), scope);
		},

	    findById: function(id, scope) {
	      return $lowlaDocument(pages.find({id: id}), scope);
	    },

	    create: function(page) {
	      return $lowlaDefer(pages.insert(page));
	    },

		byTag : function(documentId, tag) {
			//talk to local datastore here
			console.info('TODO: implement');
		},

	    delete: function(id) {
	      return $lowlaDefer(pages.remove({id: id}));
	    },

	    save: function(page) {
	      return $lowlaDefer(pages.findAndModify({ id: page.id }, page));
	    },

	    update : function(id, attrs) {
        return $lowlaDefer(pages.findAndModify({ _id: id }, { $set: attrs }));
	    }

	};

}]);

