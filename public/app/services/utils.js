angular.module('thegrandexchange')
.factory('utils', [function() {
  return {
    // Check object for non-null values in specified fields
    // Usage: if(utils.validate(obj, 'field1', 'field2')) {//success} else {//failure}
    validate: function(obj) {
      var fields = [];
      for (var i=1; i<arguments.length; i++) {
        fields.push(arguments[i]);
      }
      return fields.every(function(field) {
        return obj[field];
      });
    }
  };
}])