angular.module('thegrandexchange')
.controller('SendCtrl', [
  '$http',
  '$scope',
  '$location',
  'session',
  'users',
  function($http, $scope, $location, session, users) {
    $scope.send = function() {
      users.send($scope.email).success(function(data) {
        if (data.success) {
          $location.path('login');
        } else {
          $scope.email = '';
          $scope.warning = data.message;
        }
      });
    }
}])