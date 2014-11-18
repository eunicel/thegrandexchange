angular.module('thegrandexchange')
.controller('CompletedCtrl',[
  '$http',
  '$scope',
  '$location',
  'session',
  function($http, $scope, $location, session) {
    var date = new Date();
    var clicker = {
      name: 'clicker',
      description: 'click click click'
    }
    var eunice = {
      firstName: 'Eunice',
      lastName: 'Lin',
      email: 'eunicel@mit.edu',
      password: 'asdf'
    }
    var jeffrey = {
      firstName: 'Jeffrey',
      lastName: 'Sun',
      email: 'jeffrey@mit.edu',
      password: 'asdf'
    }
    var george = {
      firstName: 'George',
      lastName: 'Du',
      email: 'gdu@mit.edu',
      password: 'asdf'
    }
    var ami = {
      firstName: 'Ami',
      lastName: 'Suzuki',
      email: 'ami@mit.edu',
      password: 'asdf'
    }

    $scope.transactions = [
    {
      buyOffer: {
        postedBy: eunice,
        item: clicker,
        postedAt: date,
        price: 4,
        type: 'buy'
      },
      sellOffer: {
        postedBy: ami,
        item: clicker,
        postedAt: date,
        price: 3,
        type: 'sell'
      },
      item: clicker,
      price: 3
    },
    {
      buyOffer: {
        postedBy: george,
        item: clicker,
        postedAt: date,
        price: 4,
        type: 'buy'
      },
      sellOffer: {
        postedBy: eunice,
        item: clicker,
        postedAt: date,
        price: 3,
        type: 'sell'
      },
      item: clicker,
      price: 6
    },
    {
      buyOffer: {
        postedBy: jeffrey,
        item: clicker,
        postedAt: date,
        price: 4,
        type: 'buy'
      },
      sellOffer: {
        postedBy: eunice,
        item: clicker,
        postedAt: date,
        price: 3,
        type: 'sell'
      },
      item: clicker,
      price: 6
    }]
    $scope.isBuyer = function(transaction){
      if(transaction.buyOffer.postedBy.email === session.name().username){
        return true;
      } else if (transaction.sellOffer.postedBy.email === session.name().username){
        return false;
      } else {
        console.log("Logged in user did not match buyer or seller.");
      }
    }
    $scope.review = function(){

    }

  }
])