angular
  .module('isa.form')
  .directive('schema', ngSchemaDirective)
  .directive('schemaField', ngSchemaFieldDirective);

// Schema directive to be placed on the parent of schema-field.  Best placed on the <form> tag.
// <form name='myForm' schema='MySimpleSchema' schema-doc='vm.instanceOfDocumentWithMySimpleSchema'>
//
// Adds form.$getSchemaOps(forceSave)
//  - forceSave: an optional list of form field names that will always be added to the list of operations.  This is
//               useful for form controls that don't properly set $dirty/$touched, such as some of the ng-material
//               controls.
//
// returns: operations that can be passed directly to Collection.update(<id>, ops).
//
ngSchemaDirective.$inject = ['$window', '$log'];
function ngSchemaDirective($window, $log) {
  return {
    restrict: 'A',
    controller: ngSchemaController,
    require: ['schema', 'form'],
    compile: function() {
      return {
        pre: function (scope, elem, attr, ctrl) {
          var schemaCtrl = ctrl[0];
          var formCtrl = ctrl[1];

          if (!attr.name || !attr.schemaDoc) {
            $log.warn('Missing either name or schema-doc for form validation');
            return;
          }

          //we'll assume that the schemas can be found in a global object called Schemas
          schemaCtrl.$schema = $window.Schemas[attr.schema];
          if (!schemaCtrl.$schema) {
            $log.warn('Invalid schema name provided: ' + attr.schema);
            return;
          }

          schemaCtrl.$validationContext = schemaCtrl.$schema.newContext(attr.name);

          // Provide method for building update operations directly from the form controller
          formCtrl.$getSchemaOps = function(forceSave) {
            return operationsFromForm(schemaCtrl.$fields, forceSave);
          };
        },
        post: function (scope, elem, attr, ctrl) {
          var schemaCtrl = ctrl[0];

          var ctx = schemaCtrl.$validationContext;
          var offFn = scope.$watch(attr.schemaDoc, function(newVal, oldVal) {
            if (newVal) {
              _.each(schemaCtrl.$fields, function(ngModel, schemaPath) {
                _.each(ngModel.$error, function(val, errorKey) {
                  ngModel.$setValidity(errorKey, true);
                });

                ngModel.$schemaErrors = [];
                var answer = ctx.validateOne(newVal, schemaPath);
              });

              _.each(ctx.invalidKeys(), function(err) {
                var ngModel = schemaCtrl.$fields[err.name];
                ngModel.$schemaErrors.push({ key: err.name, message: ctx.keyErrorMessage(err.name) });
                ngModel.$setValidity(err.type, false);
              });
            }
          }, true);

          scope.$on('$destroy', offFn);
        }
      };
    }
  };
}

function ngSchemaController() {
  var self = this;

  this.$fields = {};
  this.$addSchemaField = function addSchemaField(schemaPath, ngModel) {
    self.$fields[schemaPath] = ngModel;
  };
}

// schema-field to be placed on input elements that match a property in a document's schema
// <input ng-model='vm.instanceOfDocumentWithMySimpleSchema.myField' name='myField' schema-field='myField'>
function ngSchemaFieldDirective() {
  return {
    restrict: 'A',
    require: ['^schema', '^ngModel'],
    link: function schemaFieldLink(scope, elem, attr, ctrl) {
      ctrl[0].$addSchemaField(attr.schemaField, ctrl[1]);
    }
 };
}

function operationsFromForm(mapSchemaToModel, forceSave) {
  forceSave = forceSave || [];
  var $set = {};
  var $unset = {};
  var ops = {};

  _.each(mapSchemaToModel, function (ngModel, schemaPath) {
    if ((ngModel.$valid && ngModel.$touched) || -1 != _.indexOf(forceSave, schemaPath)) {
      if (ngModel.$modelValue || ngModel.$modelValue === 0) {
        $set[schemaPath] = ngModel.$modelValue;
        ops.$set = $set;
      }
      else {
        $unset[schemaPath] = "";
        ops.$unset = $unset;
      }
    }
  });

  if (ops.$set || ops.$unset) {
    return ops;
  }

  return null;
}
