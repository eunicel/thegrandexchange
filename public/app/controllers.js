angular.module('thegrandexchange')
.controller('MainCtrl', [
  '$scope',
  '$location',
  'session',
  function($scope, $location, session) {

    $scope.isLoggedIn = function() {
      return session.name() !== undefined;
    }

    $scope.logout = function() {
      session.clear();
      $location.path('login');
    }
}])
.controller('LoginCtrl', [
  '$http',
  '$scope',
  '$location',
  'session',
  function($http, $scope, $location, session) {
    if (session.name()) {
      $http.post('/sessions', session.name()).success(function(response) {
        if (response.success === true) {
          $location.path('marketplace');
        } else {
          session.clear();
        }
      });
    }

    $scope.authenticate = function() {
      var userFields = {
        username: $scope.email,
        password: $scope.password
      };
      $http.post('/sessions', userFields).success(function(response) {
        if (response.success === true) {
          session.setName(userFields);
          $location.path('marketplace');
        }
      });
      $scope.email = '';
      $scope.password = '';
    }
}])
.controller('NewUsersCtrl', [
  '$http',
  '$scope',
  '$location',
  'users',
  function($http, $scope, $location, users) {
    $scope.addUser = function() {
      var newUser = {
        firstName: $scope.firstName,
        lastName: $scope.lastName,
        email: $scope.email,
        password: $scope.password
      }
      users.post(newUser).then(
        function (results) {
          if (results.data) {
            $location.path('sessions');
          }
          else {
            alert('rekt');
          }
        });
      $scope.name = '';
      $scope.password = '';
      $scope.department = '';
    }
  }
])
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
      console.log(transaction.buyOffer.postedBy.email);
      console.log(transaction.sellOffer.postedBy.email);
      console.log(session.name());
      if(transaction.buyOffer.postedBy.email === session.name().username){
        console.log('buyer');
        //$scope.buyer = transaction.buyOffer.postedBy;
        return true;
      } else if (transaction.sellOffer.postedBy.email === session.name().username){
        console.log('seller');
        //$scope.seller = transaction.sellOffer.postedBy;
        return false;
      } else {
        console.log("Logged in user did not match buyer or seller.");
      }
    }
    $scope.review = function(){

    }

  }
])
.controller('OffersCtrl',[
  '$http',
  '$scope',
  '$location',
  'session',
  function($http, $scope, $location, users) {

  }
])
.controller('ProfileCtrl',[
  '$http',
  '$scope',
  '$location',
  'session',
  function($http, $scope, $location, session) {
    $scope.name = session.name().username;
  }
])



















