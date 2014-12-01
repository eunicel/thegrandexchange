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
    $scope.flag = function(item_id){
      items.flag(session.name()._id, item_id);
    }
    $scope.toItem = function(item){
      $location.url('items/'+ item._id);
    }
    items.getAll().success(function(response) {
      $scope.items = response.items;
      if (response.success === true) {
        for (var i = 0; i < $scope.items.length; i++){
          var item = $scope.items[i];
          var offers = item.offers;
          var buyPrices = [];
          var sellPrices = [];
          for (var j = 0; j < offers.length; j++){
            var offer = offers[j];
            var price = offer.price;
            if(offer.type === 'buy'){
              buyPrices.push(price);
            } else if (offer.type === 'sell') {
              sellPrices.push(price);
            }
          }
          if(buyPrices.length > 0){
            item.bestBuy = '$' + Math.max.apply(null, buyPrices);
          } else {
            item.bestBuy = 'No offers';
          }
          if(sellPrices.length > 0){
            item.bestSell = '$' + Math.min.apply(null, sellPrices);
          } else {
            item.bestSell = 'No offers'
          }
        }

      }
      else {
        $scope.items = [{name:'no items found', description:'rekt'}];
      }
    });
}])