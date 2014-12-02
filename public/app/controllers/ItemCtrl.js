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
        type: type,
        minReputation: $scope.reputation
      };
      items.postOffer($scope.item._id, newOffer).then(function(response) {
        $scope.message = undefined;
        if (response.data.message === 'No match') {
          newOffer.postedBy = {
            firstName: session.name().firstName,
            lastName: session.name().lastName
          }
          $scope.item.offers.push(newOffer);
        }
        else if (response.data.success === false) {
          $scope.message = response.data.message;
        }
        else {
          var offers = $scope.item.offers;
          for (var i = 0; i < offers.length; i++) {
            if (offers[i].price === response.data.transaction.price) {
              offers.splice(i, 1);
              return;
            }
          }
        }
      });
    }
  }
])