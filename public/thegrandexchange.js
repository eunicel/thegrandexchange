/**
 * Contains the definition of the main module, the configuration, and the
 * services used by the controllers.
 */
angular.module('thegrandexchange', ['ui.router', 'ngCookies', 'ngTable'], function($httpProvider) {
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  // Converts an object to x-www-form-urlencoded serialization.
  // Credit: http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

    for (name in obj) {
      value = obj[name];

      if (value instanceof Array) {
        for (i = 0; i < value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if (value instanceof Object) {
        for (subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if (value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
})
.config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: '/views/login.html',
      controller: 'LoginCtrl'
    })
    .state('newUser', {
      url: '/newUser',
      templateUrl: '/views/newUser.html',
      controller: 'NewUsersCtrl'
    })
    .state('marketplace', {
      url: '/marketplace',
      templateUrl: '/views/marketplace.html',
      controller: 'MainCtrl'
    })
    .state('offers', {
      url: '/offers',
      templateUrl: '/views/offers.html',
      controller: 'OffersCtrl'
    })
    .state('completed', {
      url: '/completed',
      templateUrl: '/views/completed.html',
      controller: 'CompletedCtrl'
    })
    .state('profile', {
      url: '/profile',
      templateUrl: '/views/profile.html',
      controller: 'ProfileCtrl'
    })
    .state('item', {
      url: '/items/{id}',
      templateUrl: '/views/item.html',
      controller: 'ItemCtrl'
    })
  $urlRouterProvider.otherwise('login');
}])

// Handle highlighting in the menubar.
$(document).ready(function() {
  $('.list-group-item').on('click', function(e) {
    var previous = $(this).closest(".list-group").children(".active");
    previous.removeClass('active'); // previous list-item
    if (e.target.id === 'logout-tab') {
      $('#market-tab').addClass('active');
    }
    else {
      $(e.target).addClass('active'); // activated list-item
    }
  });
});angular.module('thegrandexchange')
.factory('items', ['$http', function($http) {
  return {
    getAll: function() {
      return $http.get('/api/items');
    },
    create: function(newItem) {
      return $http.post('/api/items', newItem);
    },
    get: function(itemID) {
      return $http.get('/api/items/' + itemID);
    },
    getOffers: function(itemID) {
      return $http.get('/api/items/' + itemID + '/offers');
    },
    postOffer: function(itemID, offer) {
      return $http.post('/api/items/' + itemID + '/offers', offer);
    },
    deleteOffer: function(itemID, offerID) {
      return $http.delete('/api/items/' + itemID + '/offers/' + offerID);
    }
  }
}]);angular.module('thegrandexchange')
.factory('session', ['$cookieStore', function($cookieStore) {
  return {
    name: function() {
      return $cookieStore.get('username');
    },
    setName: function(username) {
      $cookieStore.put('username', username);
    },
    clear: function() {
      $cookieStore.remove('username');
    }
  };
}]);angular.module('thegrandexchange')
.factory('users', ['$http', function($http) {
  return {
    create: function(userData) {
      return $http.post('/api/users', userData);
    },
    get: function(userID) {
      return $http.get('/api/users/' + userID);
    },
    getOffers: function(userID) {
      return $http.get('/api/users/' + userID + '/offers');
    },
    getReviews: function(userID) {
      return $http.get('/api/users/' + userID + '/reviews');
    },
    getTransactions: function(userID) {
      return $http.get('/api/users/' + userID + '/transactions');
    },
    postReview: function(userID, transactionID, review) {
      return $http.post('/api/users/' + userID + '/transactions/' + transactionID, review);
    }
  };
}]);angular.module('thegrandexchange')
.controller('CompletedCtrl',[
  '$http',
  '$scope',
  '$location',
  'users',
  'session',
  function($http, $scope, $location, users, session) {
    $http.get('api/users/' + session.name()._id + '/transactions')
      .success(function(data, status, headers, config){
        $scope.transactions = data.transactions;
      });
    var buyer_id;
    var seller_id;
    $scope.isBuyer = function(transaction){
      if(transaction.buyOffer.postedBy === session.name()._id){
        console.log('is buyer');
        return true;
      } else if (transaction.sellOffer.postedBy === session.name()._id){
        console.log('is seller');
        return false;
      } else {
        console.log("Logged in user did not match buyer or seller.");
      }
    }
    $scope.review = function(transaction){
      var completed = false;
      var review_score = 0;
      // completed if checkbox is checked
      if(completed){
        review_score = 1;
      } else {
        review_score = -1;
      }
      var review = {
        text: $scope.review_content,
        score: review_score
      }
      $http.post('api/users/' + session.name()._id + '/transactions/' + transaction._id, review)
        .success(function (response) {
          if(response.success){

          } else {
            console.log('Error in adding review.');
          }
        });
    }

  }
]);angular.module('thegrandexchange')
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
]);angular.module('thegrandexchange')
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
        } else {
          $scope.warning = response.data.message;
        }
      }, function(error) {
        $scope.warning = 'Invalid username and password.';
      });
      $scope.email = '';
      $scope.password = '';
    }
}]);angular.module('thegrandexchange')
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
}]);angular.module('thegrandexchange')
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
      };
      users.create(newUser).then(function (response) {
        var data = response.data;
        if (data.success === true) {
          $location.path('sessions');
        } else {
          $scope.warning = response.data.message;
        }
      }, function(error) {
        $scope.warning = error.data.message;
      });
      $scope.name = '';
      $scope.password = '';
      $scope.department = '';
    }
  }
]);angular.module('thegrandexchange')
.controller('OffersCtrl', [
  '$http',
  '$scope',
  '$filter',
  'users',
  'session',
  'ngTableParams',
  function($http, $scope, $filter, users, session, ngTableParams) {
    users.getOffers(session.name()._id).then(function(response) {
      $scope.offers = response.data.offers;

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
    });
  }
]);angular.module('thegrandexchange')
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