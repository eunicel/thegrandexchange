angular.module('thegrandexchange')
.controller('LoginCtrl', [
  '$http',
  '$scope',
  '$location',
  'session',
  function($http, $scope, $location, session) {
    if (session.name()) {
      $http.post('/api/sessions', session.name()).success(function(data) {
        if (data.success === true) {
          $location.path('marketplace');
        } else {
          session.clear();
        }
      });
    }

    $scope.authenticate = function() {
      var userFields = {
        username: $scope.email,
        password: $scope.password
      };
      $http.post('/api/sessions', userFields).success(function(data) {
        if (data.success === true) {
          userFields._id = data.userID;
          userFields.firstName = data.firstName;
          userFields.lastName = data.lastName;
          session.setName(userFields);
          $location.path('marketplace');
        } else {
          $scope.warning = response.data.message;
        }
      })
      .error(function(error) {
        $scope.warning = 'Invalid username and password.';
      });
      $scope.email = '';
      $scope.password = '';
    }
}])