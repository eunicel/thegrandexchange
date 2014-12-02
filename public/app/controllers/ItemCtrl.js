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
        $scope.error = false;
        $scope.posted = false;
        $scope.matched = false;
        // posted
        if (data.message === 'No match') {
          newOffer.postedBy = {
            firstName: session.name().firstName,
            lastName: session.name().lastName,
            reputation: $scope.userReputation
          }
          $scope.item.offers.push(newOffer);
          $scope.price = '';
          $scope.reputation = '';
          $scope.posted = true;
          $scope.message = 'Your offer has been posted.'
        }
        // error
        else if (data.success === false) {
          $scope.error = true;
          $scope.message = data.message;
        }
        // matched
        else {
          $scope.matched = true;
          $scope.message = 'Your offer has been matched. Check your completed transaction or check your email for more information.'
          var offers = $scope.item.offers;
          $scope.price = '';
          $scope.reputation = '';
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