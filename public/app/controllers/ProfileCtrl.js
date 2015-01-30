angular.module('thegrandexchange')
.controller('ProfileCtrl',[
  '$http',
  '$scope',
  '$location',
  'session',
  'users',
  function($http, $scope, $location, session, users) {
    users.get(session.name()._id).success(function(response) {
      if (response.success === true) {
        $scope.user = response.user;
      }
    });
  }
])