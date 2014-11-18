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
    $scope.toItem = function(item){
      $location.url('items/'+ item._id);
    }
    console.log(items);
    items.getAll().success(function(response) {
      if (response.success === true) {
        $scope.items = response.items;
      }
      else {
        $scope.items = [{name:'no items found', description:'rekt'}];
      }
    });
}])
.controller('LoginCtrl', [
  '$http',
  '$scope',
  '$location',
  'session',
  function($http, $scope, $location, session) {
    if (session.name()) {
      $http.post('/api/sessions', session.name()).success(function(response) {
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
      $http.post('/api/sessions', userFields).then(function(response) {
        var data = response.data;
        if (data.success === true) {
          userFields._id = data.userID;
          console.log(userFields);
          session.setName(userFields);
          $location.path('marketplace');
        }
      }, function(error) {
        $scope.warning = 'Invalid username or password.';
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
      users.create(newUser).then(
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
.controller('ProfileCtrl',[
  '$http',
  '$scope',
  '$location',
  'session',
  'users',
  function($http, $scope, $location, session, users) {
    users.get(session.name()._id).success(function(response) {
      if (response.success === true) {
        $scope.user = response.user;
      }
    });
  }
])
.controller('OffersCtrl', [
  '$http',
  '$scope',
  '$filter',
  'ngTableParams',
  function($http, $scope, $filter, ngTableParams) {
    $scope.offers = [{item:'clicker',price:30}, {item:'textbook',price:100}];

    // Set up the table that allows sorting by field.
    // Credit: http://bazalt-cms.com/ng-table/example/3
    $scope.tableParams = new ngTableParams({
      page: 1,          // show first page
      count: 10,        // count per page
      sorting: {
        name: 'asc'     // initial sorting
      }
    }, {
        total: $scope.offers.length, // length of data
        getData: function($defer, params) {
          // use built-in angular filter
          var orderedData = params.sorting() ?
                            $filter('orderBy')($scope.offers, params.orderBy()) :
                            $scope.offers;
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });
  }
])
.controller('ItemCtrl', [
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
    $scope.item = {
      name: 'Clicker',
      description: 'yada yada yada yada yada yada yada yada yada yada yada yada',
      offers: [
      {
        postedBy: eunice,
        item: clicker,
        postedAt: date,
        price: 3.5,
        type: 'buy'
      },
      {
        postedBy: ami,
        item: clicker,
        postedAt: date,
        price: 5,
        type: 'buy'
      },
      {
        postedBy: george,
        item: clicker,
        postedAt: date,
        price: 4,
        type: 'buy'
      },
      {
        postedBy: jeffrey,
        item: clicker,
        postedAt: date,
        price: 3,
        type: 'buy'
      },
      {
        postedBy: eunice,
        item: clicker,
        postedAt: date,
        price: 4,
        type: 'sell'
      },
      {
        postedBy: jeffrey,
        item: clicker,
        postedAt: date,
        price: 10,
        type: 'sell'
      },
      {
        postedBy: george,
        item: clicker,
        postedAt: date,
        price: 100,
        type: 'sell'
      },
      {
        postedBy: ami,
        item: clicker,
        postedAt: date,
        price: 4,
        type: 'sell'
      }]
    }
    $scope.order = 'price';

  }
])



