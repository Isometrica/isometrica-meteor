angular
  .module('isa.form')
  .directive('schema', ngSchemaDirective)
  .directive('schemaField', ngSchemaFieldDirective);

// Schema directive to be placed on the parent of schema-field.  Best placed on the <form> tag.
// <form name='myForm' schema='MySimpleSchema' schema-doc='vm.instanceOfDocumentWithMySimpleSchema'>
ngSchemaDirective.$inject = ['$window'];
function ngSchemaDirective($window) {
  return {
    restrict: 'A',
    controller: ngSchemaController,
    require: 'schema',
    compile: function() {
      return {
        pre: function (scope, elem, attr, ctrl) {
          if (!attr.name || !attr.schemaDoc) {
            console.warn('Missing either name or schema-doc for form validation');
            return;
          }

          //we'll assume that the schemas can be found in a global object called Schemas
          ctrl.$schema = $window.Schemas[attr.schema];
          if (!ctrl.$schema) {
            console.warn('Invalid schema name provided: ' + attr.schema);
            return;
          }

          ctrl.$validationContext = ctrl.$schema.newContext(attr.name);
        },
        post: function (scope, elem, attr, ctrl) {
          var ctx = ctrl.$validationContext;
          var offFn = scope.$watch(attr.schemaDoc, function(newVal, oldVal) {
            if (newVal) {
              console.log("Validating:", newVal);

              _.each(ctrl.$fields, function(ngModel, schemaPath) {
                console.log(schemaPath, 'model errors', ngModel.$error);
                _.each(ngModel.$error, function(val, errorKey) {
                  console.log('Clearing error', errorKey, 'for', schemaPath);
                  ngModel.$setValidity(errorKey, true);
                });

                ngModel.$schemaErrors = [];
                var answer = ctx.validateOne(newVal, schemaPath);
                console.log('That validated as', answer);
              });

              _.each(ctx.invalidKeys(), function(err) {
                console.log('Setting', err.name, 'to invalid:', err.type);
                var ngModel = ctrl.$fields[err.name];
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

ngSchemaController.$inject = ['$element'];
function ngSchemaController($element) {
  var ctrl = $element.inheritedData('$formController');
  console.log("FormController", ctrl);

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
