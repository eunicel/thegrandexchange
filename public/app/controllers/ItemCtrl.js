angular.module('thegrandexchange')
.controller('ItemCtrl', [
  '$http',
  '$scope',
  '$location',
  '$stateParams',
  'session',
  'items',
  'users',
  function($http, $scope, $location, $stateParams, session, items, users) {
    $scope.order = 'price';
    users.get(session.name()._id).success(function(data) {
      $scope.userReputation = data.user.reputation;
      items.get($stateParams.id).success(function(data2) {
        $scope.item = data2.item;
      });
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
      items.postOffer($scope.item._id, newOffer).success(function(data) {
        $scope.message = undefined;
        if (data.message === 'No match') {
          newOffer.postedBy = {
            firstName: session.name().firstName,
            lastName: session.name().lastName,
            reputation: $scope.userReputation
          }
          $scope.item.offers.push(newOffer);
          $scope.price = '';
          $scope.reputation = '';
        }
        else if (data.success === false) {
          $scope.message = data.message;
        }
        else {
          var offers = $scope.item.offers;
          for (var i = 0; i < offers.length; i++) {
            if (offers[i].price === data.transaction.price) {
              offers.splice(i, 1);
              return;
            }
          }
        }
      });
    }
  }
])