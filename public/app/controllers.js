angular.module('thegrandexchange')
.controller('MainCtrl', [
  '$scope',
  '$location',
  'session',
  function($scope, $location, session) {
    $scope.isLoggedIn = function() {
      return session.name() !== undefined;
    }

    $scope.logout = function() {
      session.clear();
      $location.path('login');
    }
}])
.controller('LoginCtrl', [
  '$scope',
  '$location',
  'session',
  function($scope, $location, session) {
    if (session.name()) {
      $http.post('/sessions', session.name()).success(function(response) {
        if (response.success) {
          $location.path('marketplace');
        } else {
          session.clear();
        }
      });
    }

    $scope.authenticate = function() {
      if ($scope.name === '') { return; }
      var userFields = {
        username: $scope.email,
        password: $scope.password
      }
      $http.post('/sessions', userFields).success(function(response) {
        if (response.success === true) {
          session.setName(userFields);
          $location.path('marketplace');
        }
      });
      $scope.name = '';
      $scope.password = '';
    }
}])