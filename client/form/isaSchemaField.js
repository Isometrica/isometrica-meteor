angular
  .module('isa.form')
  .directive('isaSchemaField', isaSchemaFieldDirective);

// Quick-and-dirty template directive for generating <input> fields based on SimpleSchema specifications.
// Requires a parent element to have the schema and schema-doc attributes.
//
// <isa-schema-field model="vm.schemaDocInstance.schemaField" name="doesntMatter" field="schemaField"
//                   hide-label="true|false (default)"
//                    label-class="optional-classes-ie-col-sm-4" input-class="optional-classes-ie-col-sm-8">
// </isa-schema-field>
//
//supports the following field types:
//- none (defaults to <input> field)
//- textarea: <isa-schema-field field-type="textarea" ...
//- date: <isa-schema-field field-type="date" ...
isaSchemaFieldDirective.$inject = ['$log'];
function isaSchemaFieldDirective($log) {
  return {
    restrict: 'E',
    templateUrl: function(element, attr) { return 'client/form/isaSchemaField' + (attr.fieldType ? '-' + attr.fieldType : '') + '.ng.html' },
    scope: {
      model: '=?',
      field: '@',
      name: '@',
      fieldType : '@',
      placeholder : '@',
      hideLabel : '@'
    },
    require: ['^form', '^schema'],
    compile: function() {
      return {
        pre: function(scope, elem, attr, ctrl) {

          var schema = ctrl[1];

          scope._schema = schema.$schema.schema(scope.field);

          if (!scope._schema) {
            $log.error('Schema definition for field \'' + scope.field + '\' not found');
            return;
          }

          scope._schema.isa = scope._schema.isa || {};

          scope.label = scope._schema.label || scope.field;
          scope.placeholder = scope._schema.placeholder || scope.placeholder || scope.label;

          if (scope._schema.type.name === 'Number') {
            scope.inputType = 'number';
          } else if (scope._schema.type.name === 'Date') {
            scope.inputType = 'date';
          } else {
            scope.inputType = 'text';
          }
          scope.required = !scope._schema.optional;
          scope.helpId = scope._schema.isa.helpId;
          scope.labelClass = attr.labelClass || 'col-sm-3';
          scope.inputClass = attr.inputClass || 'col-sm-9';

          scope.hideLabel = (attr.hideLabel === 'true' ? true : false);
          if (scope.hideLabel) {    //no col width when the label is hidden
            scope.inputClass = '';
          }

        },
        post: function(scope, elem, attr, ctrl) {
          var ngModel = ctrl[0];

          scope.$dirty = false;

          scope.$watch(function() {
            $log.debug('Checking on', scope.name, 'btw, field is', scope.field);
            scope.$dirty = ngModel[scope.name].$dirty;
            return ngModel[scope.name].$schemaErrors;
          }, function(newVal, oldVal) {
            $log.debug('ngModel:', newVal);
            scope.invalid = newVal && newVal.length;
            scope.schemaError = scope.invalid ? newVal[0].message : '';
          });
        }
      };
    },

    controller : function($scope) {

      //date picker functions
      $scope.openDatePicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };

    }
  };
}
