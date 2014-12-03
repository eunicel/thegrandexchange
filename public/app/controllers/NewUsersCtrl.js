angular.module('thegrandexchange')
.controller('NewUsersCtrl', [
  '$http',
  '$scope',
  '$location',
  'users',
  'utils',
  function($http, $scope, $location, users, utils) {
    $scope.addUser = function() {
      if ($scope.password !== $scope.passwordCheck) {
        $scope.warning = 'Passwords do not match';
      }
      else {
        var newUser = {
          firstName: $scope.firstName,
          lastName: $scope.lastName,
          email: $scope.email,
          password: $scope.password
        };
        if (utils.validate(newUser, 'firstName', 'lastName', 'email', 'password')) {
          users.create(newUser).success(function (data) {
            if (data.success) {
              $location.path('verification');
            } else {
              $scope.warning = data.message;
            }
          })
          .error(function(error) {
            $scope.warning = error.data.message;
          });
        } else {
          $scope.warning = 'All fields are required.';
        }
      }
      $scope.password = '';
      $scope.passwordCheck = '';
    }
  }
])