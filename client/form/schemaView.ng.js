angular
  .module('isa.form')
  .directive('schemaView', schemaViewDirective)
  .directive('schemaViewFields', schemaViewFieldsDirective)
  .directive('schemaViewField', schemaViewFieldDirective);

/*
 * schema-view, schema-view-fields, schema-view-field
 *
 * <div schema-view="<Schema Name>:<model object>">
 *   <!-- render multiple fields  -->
 *   <schema-view-fields fields="<field1>,<field2>,<columnField1>+<columnField2>"
 *                       [ labels="{<field1>: <Label override>, <columnField2>: <Label override>}" ]
 *                       [ views="{<columnField2>: <View type override>}"> ]>
 *   </schema-view-fields>
 *
 *   <!-- render a single field -->
 *   <div schema-view-field="<single field>"
 *        [ schema-view-label="Label override" ]
 *        [ schema-view-type="View type override" ]>
 *   </div>
 * </div>
 *
 * The 'fields' attribute to schema-view-fields is a comma-separated list of fields, similar to schema-form.  However,
 * fields separated by a plus (+) instead of comma will be rendered on the same row rather than vertically.
 *
 * The 'labels' attribute to schema-view-fields is a dictionary mapping field names to labels.  This will override
 * any labels defined in the schema and also provide a way to specify the label if the schema does not.
 *
 * The 'views' attribute to schema-view-fields is a dictionary mapping field names to view types.  This will override
 * any built in view types that are based on field types and also provide a way to specify the view type if the schema
 * does not provide a field type (eg 'created.at' timestamp).
 *
 * View types are defined in the schemaViewFieldDirective function below.  Fields will be rendered as strings by
 * default.
 *
 * TODO: consider moving view type definition into a service/provider and possibly support templates as well as strings.
 */
function schemaViewDirective() {
  return {
    restrict: 'A',
    controller: function($window, $scope) {
      var ctrl = this;
      this.setModelFrom = function(model) {
        var parts = model.split(':');
        ctrl.schema = $window.Schemas[parts[0]];
        ctrl.model = $scope.$eval(parts[1]);
      };
    },
    require: 'schemaView',
    link: {
      pre: function(scope, elem, attr, ctrl) {
        elem.addClass('list-group');
        ctrl.setModelFrom(attr.schemaView);
      }
    }
  }
}

function schemaViewFieldsDirective($parse) {
  return {
    restrict: 'E',
    require: '^schemaView',
    scope: {
      rawFields: '@fields',
      labels: '='
    },
    compile: function(tElement, tAttrs) {
      var labels = tAttrs.labels ? $parse(tAttrs.labels)() : {};
      var views = tAttrs.views ? $parse(tAttrs.views)() : {};

      _.each(tAttrs.fields.split(','), function(fieldOrCols) {
        var cols = fieldOrCols.trim().split('+');
        if (1 === cols.length) {
          tElement.append(makeElem(cols[0]));
        }
        else {
          var row = angular.element('<div class="row"></div>');
          _.each(cols, function(field) {
            var col = angular.element('<div class="col-sm-' + Math.floor(12 / cols.length) + '"></div>');
            col.append(makeElem(field));
            row.append(col);
          });
          tElement.append(row);
        }
      });

      function makeElem(field) {
        field = field.trim();
        var elem = angular.element('<div></div>');
        elem.attr('schema-view-field', field);
        if (labels.hasOwnProperty(field)) {
          elem.attr('schema-view-label', labels[field]);
        }
        if (views.hasOwnProperty(field)) {
          elem.attr('schema-view-type', views[field]);
        }
        return elem;
      }
    }
  }
}

function schemaViewFieldDirective($compile) {
  return {
    restrict: 'A',
    require: '^schemaView',
    link: linkFn,
    scope: true
  };

  function linkFn(scope, el, attrs, schemaView) {
    var viewTypes = {
      'default': '{{view.model[view.key]}}',
      'isaUser': '{{view.model[view.key].fullName}}',
      'isaDate': '{{view.model[view.key] | isaDate}}',
      'isaMeeting': '<isa-meeting-ref meeting-id="{{view.model[view.key].meetingId}}"></isa-meeting-ref>',
      'isaStatus': '<isa-action-status action="{{view.model}}" label="true"></isa-action-status>'
    };

    el.addClass('list-group-item');
    var fieldSchema = schemaView.schema.schema(attrs.schemaViewField);
    scope.view = {
      label: attrs.schemaViewLabel || fieldSchema.label,
      model: schemaView.model,
      key: attrs.schemaViewField,
      schema: fieldSchema
    };

    var fieldParts = scope.view.key.split('.');
    if (1 != fieldParts.length) {
      var root = schemaView.model;
      while (fieldParts.length > 1) {
        var pathStep = fieldParts.shift();
        if (typeof root[pathStep] === 'undefined') {
          root[pathStep] = fieldParts.length === 0 ? { value:  '' } : {};
        }
        root = root[pathStep];
      }
      scope.view.key = fieldParts[0];
      scope.view.model = root;
    }

    var viewType = attrs.schemaViewType ||
      (fieldSchema.isa ? fieldSchema.isa.fieldType : undefined) ||
      (typeof fieldSchema.type.UTC === 'function' ? 'isaDate' : undefined);

    var valHtml = viewTypes[viewType] || viewTypes['default'];
    var childElFn = $compile('<p class="list-group-item-text">{{view.label}}</p><h4 class="list-group-item-heading">' + valHtml + '</h4>');
    var childEl = childElFn(scope);
    el.append(childEl);
  }
}
