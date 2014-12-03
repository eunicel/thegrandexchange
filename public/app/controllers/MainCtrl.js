angular.module('thegrandexchange')
.controller('MainCtrl', [
  '$scope',
  '$location',
  'session',
  'items',
  'utils',
  function($scope, $location, session, items, utils) {

    $scope.isLoggedIn = function() {
      return session.name() !== undefined;
    }

    $scope.flagged = function(item) {
      return item.flags.indexOf(session.name()._id) > -1;
    }

    $scope.userid = function() {
      return session.user()._id;
    }

    $scope.logout = function() {
      session.clear();
      session.serverLogout().success(function(data) {
        $location.path('login');
      });
    }
    $scope.flag = function(item){
      items.flag(session.name()._id, item._id).success(function(data) {
        if (data.success) {
          item.flags.push(session.name()._id);
        }
      }.bind(this));
    }
    $scope.toItem = function(item){
      $location.url('items/'+ item._id);
    }
    $scope.addItem = function(){
      var item = {
        name: $scope.name,
        description: $scope.description
      }
      if (utils.validate(item, 'name', 'description')) {
        items.create(item).success(function(data) {
          data.item.bestSell = 'No offers';
          data.item.bestBuy = 'No offers';
          $scope.items.push(data.item);
          $scope.name = '';
          $scope.description = '';
        });
      } else {
        alert("Please enter a name and a description.")
      }
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