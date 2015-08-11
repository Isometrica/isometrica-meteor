angular
  .module('isa.form')
  .directive('schemaForm', schemaFormDirective);

function schemaFormDirective($log) {
  return {
    template: '<formly-form model="model" fields="formlyFields" options="formlyOptions"></formly-form>',
    require: '^schema',
    scope: {
      rawModel: '=model',
      fields: '@',
      hideLabel: '@',
      templateOptions: '@',
      configureFn: '&configure'
    },
    link: function(scope, elem, attr, schemaCtrl) {
      if (scope.rawModel.getRawObject) {
        scope.model = scope.rawModel.getRawObject();

        // Update AngularMeteorObject w/ changes from the raw object
        scope.$watch('model', function(newVal) {
          if (newVal) {
            angular.extend(scope.rawModel, newVal);
          }
        }, true);

        // Update formly model (raw object) w/ changes from AngularMeteorObject
        scope.$watch(function() {
          return scope.rawModel.getRawObject();
        }, function (newVal) {
          if (newVal) {
            angular.extend(scope.model, newVal);
          }
        }, true);
      }
      else {
        scope.model = scope.rawModel;
      }

      var fieldNames = attr.fields.split(',');
      scope.formlyFields = formFromSchema(schemaCtrl.$schema, fieldNames);
      if (attr.templateOptions) {
        try {
          var overrides = JSON.parse(attr.templateOptions);
          _.each(overrides, function(val, key) {
            var fieldDef = _.findWhere(scope.formlyFields, {key: key});
            if (fieldDef) {
              _.extend(fieldDef.templateOptions, val);
            }
            else {
              $log.warn('Did not find field def for', key);
            }
          });
        }
        catch (e) {
          $log.warn('While parsing', attr.templateOptions);
          $log.warn(e);
        }
      }
      if (scope.configureFn) {
        scope.configureFn({fields: scope.formlyFields, scope: scope});
      }


      scope.formlyOptions = {
        formState: {
          hideLabel: "true" === attr.hideLabel
        }
      };
    }
  };
}

function formFromSchema(schema, fields) {
  var answer = [];
  _.each(fields, function(field) {
    var item = schema.schema(field);

    // If it isn't a schema field, it's probably inline template.
    if (!item) {
      answer.push(field);
      return;
    }

    // Set up some simple defaults
    var fieldDef = {
      key: field,
      type: 'isaInput',
      templateOptions: {},
      ngModelAttrs: {
        '{{options.key}}': {
          value: 'schema-field'
        }
      }
    };

    // Copy common attributes from toplevel schema to the template options
    var to = fieldDef.templateOptions;
    _.each(['label', 'placeholder', 'min', 'max'], function (attr) {
      to[attr] = item[attr];
    });
    if (item.type === Number) {
      to.type = 'number';
    }
    else if (typeof item.type.UTC === "function") {
      fieldDef.type = 'isaDate';
    }

    // Copy Isometrica-specific attributes over
    if (item.isa) {
      _.each(['helpId', 'placeholder', 'rows', 'cols'], function (attr) {
        to[attr] = item.isa[attr];
      });

      if (item.isa.fieldType) {
        fieldDef.type = item.isa.fieldType;
      }
      if (item.isa.fieldChoices) {
        fieldDef.templateOptions.choices = item.isa.fieldChoices;
      }
      if (item.isa.inputType) {
        to.type = item.isa.inputType;
      }
      if (item.isa.focus) {
        to.focus = item.isa.focus;
      }
    }

    if (item.hasOwnProperty('optional') && item.optional) {
      to.required = false;
    }
    else {
      to.required = true;
    }

    answer.push(fieldDef);
  });

  return answer;
}
