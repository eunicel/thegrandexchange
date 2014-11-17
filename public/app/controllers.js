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
  '$http',
  '$scope',
  '$location',
  'session',
  function($http, $scope, $location, session) {
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
.controller('NewUsersCtrl', [
  '$http',
  '$scope',
  '$location',
  'users',
  function($http, $scope, $location, users) {
    $scope.addUser = function() {
      var newUser = {
        firstName: $scope.firstName,
        lastName: $scope.lastName,
        email: $scope.email,
        password: $scope.password
      }
      users.post(newUser).then(
        function (results) {
          if (results.data) {
            $location.path('sessions');
          }
          else {
            alert('rekt');
          }
        });
      $scope.name = '';
      $scope.password = '';
      $scope.department = '';
    }
  }
])