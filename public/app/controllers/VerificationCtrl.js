angular.module('thegrandexchange')
.controller('VerificationCtrl', [
  '$http',
  '$scope',
  '$location',
  'session',
  'users',
  function($http, $scope, $location, session, users) {
    $scope.verify = function() {
      users.verify($scope.activationCode).success(function(data) {
        if (data.success) {
          $location.path('login');
        }
        else {
          $scope.activationCode = '';
          $scope.warning = data.message;
        }
      });
    }
}])