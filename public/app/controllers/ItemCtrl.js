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
        console.log(response.data);
        if (response.data.transaction === 'No match') {
          newOffer.postedBy = {
            firstName: session.name().firstName,
            lastName: session.name().lastName
          }
          $scope.item.offers.push(newOffer);
        }
        else if (response.data.transaction) {
          console.log('transaction matched');
          console.log(response.data.transaction);
          var offers = $scope.item.offers;
          for (var i = 0; i < offers.length; i++) {
            if (offers[i].price === response.data.transaction.price) {
              offers.splice(i, 1);
              return;
            }
          }
          console.log('failure to remove item');
        }
      }.bind(this), function(error) {
        console.log(error);
      });
    }
  }
])