angular.module('thegrandexchange')
.controller('MainCtrl', [
  '$scope',
  '$location',
  'session',
  'items',
  function($scope, $location, session, items) {

    $scope.isLoggedIn = function() {
      return session.name() !== undefined;
    }

    $scope.logout = function() {
      session.clear();
      $location.path('login');
    }
    $scope.toItem = function(item){
      $location.url('items/'+ item._id);
    }
    console.log(items);
    items.getAll().success(function(response) {
      if (response.success === true) {
        $scope.items = response.items;
      }
      else {
        $scope.items = [{name:'no items found', description:'rekt'}];
      }
    });
}])