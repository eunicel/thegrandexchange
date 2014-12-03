angular.module('thegrandexchange')
.factory('session', ['$cookieStore', '$http', function($cookieStore, $http) {
  return {
    name: function() {
      return $cookieStore.get('username');
    },
    setName: function(username) {
      $cookieStore.put('username', username);
    },
    clear: function() {
      $cookieStore.remove('username');
    },
    serverLogin: function(userFields) {
      return $http.post('/api/sessions', userFields);
    },
    serverLogout: function() {
      return $http.delete('/api/sessions');
    }
  };
}])