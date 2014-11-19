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
    items.getAll().success(function(response) {
      if (response.success === true) {
        var items = response.items;
        console.log(items);
        for (var i = 0; i < items.length;i++){
          var item = items[i];
          console.log(item);
          var offers = item.offers;
          console.log(offers);
        }
        $scope.items = response.items;
      }
      else {
        $scope.items = [{name:'no items found', description:'rekt'}];
      }
    });
}])