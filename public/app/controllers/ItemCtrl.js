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
    users.get(session.name()._id).success(function(response) {
      if(response.success === true) {
        $scope.user = response.user;
      }
    });
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
        $scope.error = false;
        $scope.posted = false;
        $scope.matched = false;

        // posted
        if (response.data.message === 'No match') {
          newOffer.postedBy = {
            firstName: session.name().firstName,
            lastName: session.name().lastName,
            // reputation: session.name().reputation
          }
          $scope.item.offers.push(newOffer);
          $scope.price = '';
          $scope.reputation = '';
          $scope.posted = true;
          $scope.message = 'Your offer has been posted.'
        }
        // error
        else if (response.data.success === false) {
          $scope.error = true;
          $scope.message = response.data.message;
        }
        // matched
        else {
          $scope.matched = true;
          $scope.message = 'Your offer has been matched. Check your completed transaction or check your email for more information.'
          var offers = $scope.item.offers;
          $scope.price = '';
          $scope.reputation = '';
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