angular.module('thegrandexchange')
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
      };
      users.create(newUser).then(function (response) {
        var data = response.data;
        if (data.success === true) {
          $location.path('sessions');
        } else {
          $scope.warning = response.data.message;
        }
      }, function(error) {
        $scope.warning = error.data.message;
      });
      $scope.name = '';
      $scope.password = '';
      $scope.department = '';
    }
  }
])