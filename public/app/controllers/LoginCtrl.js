angular.module('thegrandexchange')
.controller('LoginCtrl', [
  '$scope',
  '$location',
  'session',
  function($scope, $location, session) {
    if (session.name()) {
      session.serverLogin(session.name()).success(function(data) {
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
      session.serverLogin(userFields).success(function(data) {
        if (data.success === true) {
          userFields._id = data.userID;
          userFields.firstName = data.firstName;
          userFields.lastName = data.lastName;
          session.setName(userFields);
          $location.path('marketplace');
        } else {
          $scope.warning = data.message;
        }
      })
      .error(function(data) {
        console.log(arguments);
        console.log(data);
        $scope.warning = 'Invalid username and password.';
      });
      $scope.email = '';
      $scope.password = '';
    }
}])