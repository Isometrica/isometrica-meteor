angular
  .module('isa.form')
  .directive('isaSchemaField', isaSchemaFieldDirective);

// Quick-and-dirty template directive for generating <input> fields based on SimpleSchema specifications.
// Requires a parent element to have the schema and schema-doc attributes.
//
// <isa-schema-field model="vm.schemaDocInstance.schemaField" name="doesntMatter" field="schemaField"
//                   label-class="optional-classes-ie-col-sm-4" input-class="optional-classes-ie-col-sm-8">
// </isa-schema-field>
function isaSchemaFieldDirective() {
  return {
    restrict: 'E',
    templateUrl: 'client/form/isaSchemaField.ng.html',
    scope: {
      model: '=?',
      field: '@',
      name: '@'
    },
    require: ['^form', '^schema'],
    compile: function() {
      return {
        pre: function(scope, elem, attr, ctrl) {
          var schema = ctrl[1];

          scope._schema = schema.$schema.schema(scope.field);
          scope._schema.isa = scope._schema.isa || {};

          scope.label = scope._schema.label || scope.field;
          scope.placeholder = scope._schema.placeholder || scope.label;
          if (scope._schema.type === Number) {
            scope.inputType = 'number';
          }
          else {
            scope.inputType = 'text';
          }
          scope.required = !scope._schema.optional;
          scope.helpId = scope._schema.isa.helpId;
          scope.labelClass = attr.labelClass || 'col-sm-3';
          scope.inputClass = attr.inputClass || 'col-sm-9';

        },
        post: function(scope, elem, attr, ctrl) {
          var ngModel = ctrl[0];

          scope.$watch(function() {
            return ngModel[scope.name].$schemaErrors;
          }, function(newVal, oldVal) {
            scope.invalid = newVal && newVal.length;
            scope.schemaError = scope.invalid ? newVal[0].message : '';
          });
        }
      }
    }
  };
}
