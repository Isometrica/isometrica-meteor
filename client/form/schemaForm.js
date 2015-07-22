angular
  .module('isa.form')
  .directive('schemaForm', schemaFormDirective);

function schemaFormDirective() {
  return {
    template: '<formly-form model="model" fields="formlyFields" options="formlyOptions"></formly-form>',
    require: '^schema',
    scope: {
      model: '=',
      fields: '@',
      hideLabel: '@'
    },
    link: function(scope, elem, attr, schemaCtrl) {
      var fieldNames = attr.fields.split(',');
      scope.formlyFields = formFromSchema(schemaCtrl.$schema, fieldNames);
      scope.formlyOptions = {
        formState: {
          hideLabel: "true" === attr.hideLabel
        }
      };
    }
  }
}

function isaFormService() {
  return {
    fromSchema: formFromSchema
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
    else if (item.type === Date) {
      fieldDef.type = 'isaDate';
    }

    // Copy Isometrica-specific attributes over
    if (item.isa) {
      _.each(['helpId', 'placeholder'], function (attr) {
        to[attr] = item.isa[attr];
      });

      if (item.isa.fieldType) {
        fieldDef.type = item.isa.fieldType;
      }
      if (item.isa.inputType) {
        to.type = item.isa.inputType;
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
