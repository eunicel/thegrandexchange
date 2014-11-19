angular.module('thegrandexchange')
.controller('ItemCtrl', [
  '$http',
  '$scope',
  '$location',
  '$stateParams',
  'session',
  'items',
  function($http, $scope, $location, $stateParams, session, items) {
    $scope.order = 'price';

    items.get($stateParams.id).then(function(response) {
      $scope.item = response.data.item;
    });
    $scope.offer = function(type) {
      // type = 'buy' or 'sell'
      var newOffer = {
        postedBy: session.name()._id,
        item: $scope.item._id,
        postedAt: Date.now(),
        price: parseInt($scope.price, 10),
        type: type
      };
      items.postOffer($scope.item._id, newOffer).then(function(response) {
        if (response.data.offer === 'No match') {
          $scope.item.offers.push(newOffer);
        } else if (true) {
          // check if response has a transaction
          // show transaction related stuff
        }
      }.bind(this), function(error) {
        console.log(error);
      });
    }
  }
])