angular.module('thegrandexchange')
.factory('utils', [function() {
  return {
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