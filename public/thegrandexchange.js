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
    .state('verification', {
      url: '/verification',
      templateUrl: '/views/verification.html',
      controller: 'VerificationCtrl'
    })
  $urlRouterProvider.otherwise('login');
}])

// Handle highlighting in the menubar.
$(document).ready(function() {
  $('.sidebar-item').on('click', function(e) {
    var previous = $(this).parent().children(".active");
    previous.removeClass('active'); // previous list-item
    if (e.target.id === 'logout-tab') {
      $('#market-tab').addClass('active');
    }
    else {
      $(this).addClass('active'); // activated list-item
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
    },
    flag: function(userID, itemID) {
      return $http.post('/api/items/' + itemID + '/flags');
    }
  }
}]);angular.module('thegrandexchange')
.factory('session', ['$cookieStore', '$http', function($cookieStore, $http) {
  return {
    name: function() {
      return $cookieStore.get('username');
    },
    setName: function(username) {
      $cookieStore.put('username', username);
    },
    clear: function() {
      $cookieStore.remove('username');
    },
    serverLogin: function(userFields) {
      return $http.post('/api/sessions', userFields);
    },
    serverLogout: function() {
      return $http.delete('/api/sessions');
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
    },
    verify: function(userID) {
      return $http.put('/api/users/' + userID + '/verification');
    }
  };
}]);angular.module('thegrandexchange')
.factory('utils', [function() {
  return {
    // Check object for non-null values in specified fields
    // Usage: if(utils.validate(obj, 'field1', 'field2')) {//success} else {//failure}
    validate: function(obj) {
      var fields = [];
      for (var i=1; i<arguments.length; i++) {
        fields.push(arguments[i]);
      }
      return fields.every(function(field) {
        return obj[field];
      });
    }
  };
}]);angular.module('thegrandexchange')
.controller('CompletedCtrl',[
  '$scope',
  'users',
  'session',
  'utils',
  function($scope, users, session, utils) {
    users.getTransactions(session.name()._id).success(function (data) {
      var transactions = data.transactions;
      var displayed_transactions = [];
      for (var i = 0; i < transactions.length; i++) {
        transactions[i].index = i;
        if(transactions[i].buyOffer.postedBy._id === session.name()._id && !transactions[i].buyerRated){
          transactions[i].isBuyer = true;
          displayed_transactions.push(transactions[i]);
        } else if (transactions[i].sellOffer.postedBy._id === session.name()._id && !transactions[i].sellerRated){
          transactions[i].isBuyer = false;
          displayed_transactions.push(transactions[i]);
        }
      }
      $scope.transactions = displayed_transactions;
    });

    $scope.review = function(transaction) {
      var review_score = transaction.score;
      var newReview = {
        text: transaction.review_content,
        score: transaction.score
      };
      console.log(newReview);
      if (utils.validate(newReview, 'text', 'score')) {
        users.postReview(session.name()._id, transaction._id, newReview).success(function (data) {
          if (data.success) {
            for (var i = 0; i < $scope.transactions.length; i++) {
              if ($scope.transactions[i]._id === transaction._id) {
                $scope.transactions.splice(i, 1);
                return;
              }
            }
          } else {
            // failed
          }
        });
      } else {
        alert("Please rate and leave a message.");
      }
    };
  }
]);angular.module('thegrandexchange')
.controller('ItemCtrl', [
  '$http',
  '$scope',
  '$location',
  '$stateParams',
  'session',
  'items',
  'users',
  'utils',
  function($http, $scope, $location, $stateParams, session, items, users, utils) {
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
      if (utils.validate(newOffer, 'price', 'minReputation')) {
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
      } else {
        $scope.error = true;
        $scope.message = 'Please fill in price and min reputation.';
        console.log($scope.message);
      }
    }
  }
]);angular.module('thegrandexchange')
.controller('LoginCtrl', [
  '$scope',
  '$location',
  'session',
  'utils',
  function($scope, $location, session, utils) {
    if (session.name()) {
      session.serverLogin(session.name()).success(function(data) {
        if (data.success === true) {
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
      if (utils.validate(userFields, 'username', 'password')) {
        server.serverLogin(userFields).success(function(data) {
          if (data.success === true) {
            userFields._id = data.userID;
            userFields.firstName = data.firstName;
            userFields.lastName = data.lastName;
            session.setName(userFields);
            $location.path('marketplace');
          } else {
            $location.path('verification');
          }
        })
        .error(function(data) {
          console.log(arguments);
          console.log(data);
          $scope.warning = 'Invalid username and password.';
        });
        $scope.email = '';
        $scope.password = '';
      }
      else {
        $scope.warning = 'Please fill out username and password.';
      }
    }
}]);angular.module('thegrandexchange')
.controller('MainCtrl', [
  '$scope',
  '$location',
  'session',
  'items',
  'utils',
  function($scope, $location, session, items, utils) {

    $scope.isLoggedIn = function() {
      return session.name() !== undefined;
    }

    $scope.flagged = function(item) {
      return item.flags.indexOf(session.name()._id) > -1;
    }

    $scope.userid = function() {
      return session.user()._id;
    }

    $scope.logout = function() {
      session.clear();
      session.serverLogout().success(function(data) {
        $location.path('login');
      });
    }
    $scope.flag = function(item){
      items.flag(session.name()._id, item._id).success(function(data) {
        if (data.success) {
          item.flags.push(session.name()._id);
        }
      }.bind(this));
    }
    $scope.toItem = function(item){
      $location.url('items/'+ item._id);
    }
    $scope.addItem = function(){
      var item = {
        name: $scope.name,
        description: $scope.description
      }
      if (utils.validate(item, 'name', 'description')) {
        items.create(item).success(function(data) {
          data.item.bestSell = 'No offers';
          data.item.bestBuy = 'No offers';
          $scope.items.push(data.item);
          $scope.name = '';
          $scope.description = '';
        });
      } else {
        alert("Please enter a name and a description.")
      }
    }

    items.getAll().success(function(response) {
      $scope.items = response.items;
      if (response.success === true) {
        for (var i = 0; i < $scope.items.length; i++){
          var item = $scope.items[i];
          var offers = item.offers;
          var buyPrices = [];
          var sellPrices = [];
          for (var j = 0; j < offers.length; j++){
            var offer = offers[j];
            var price = offer.price;
            if(offer.type === 'buy'){
              buyPrices.push(price);
            } else if (offer.type === 'sell') {
              sellPrices.push(price);
            }
          }
          if(buyPrices.length > 0){
            item.bestBuy = '$' + Math.max.apply(null, buyPrices);
          } else {
            item.bestBuy = 'No offers';
          }
          if(sellPrices.length > 0){
            item.bestSell = '$' + Math.min.apply(null, sellPrices);
          } else {
            item.bestSell = 'No offers'
          }
        }

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
  'utils',
  function($http, $scope, $location, users, utils) {
    $scope.addUser = function() {
      if ($scope.password !== $scope.passwordCheck) {
        $scope.warning = 'Passwords do not match';
      }
      else {
        var newUser = {
          firstName: $scope.firstName,
          lastName: $scope.lastName,
          email: $scope.email,
          password: $scope.password
        };
        if (utils.validate(newUser, 'firstName', 'lastName', 'email', 'password')) {
          users.create(newUser).success(function (data) {
            if (data.success) {
              $location.path('verification');
            } else {
              $scope.warning = data.message;
            }
          })
          .error(function(error) {
            $scope.warning = error.data.message;
          });
        } else {
          $scope.warning = 'All fields are required.';
        }
      }
      $scope.password = '';
      $scope.passwordCheck = '';
    }
  }
]);angular.module('thegrandexchange')
.controller('OffersCtrl', [
  '$http',
  '$scope',
  '$filter',
  '$timeout',
  'users',
  'session',
  'items',
  'ngTableParams',
  function($http, $scope, $filter, $timeout, users, session, items, ngTableParams) {
    $scope.offers = [];

    $scope.deleteOffer = function (offer) {
      items.deleteOffer('offer.item._id', offer._id).success(function(data) {
        for (var i = 0; i < $scope.offers.length; i++) {
          if ($scope.offers[i]._id === offer._id) {
            $scope.offers.splice(i, 1);
            $scope.tableParams.reload();
            return;
          }
        }
      }); // 'offer.item._id' doesn't actually get used
    }
    users.getOffers(session.name()._id).success(function(data) {
      $scope.offers = data.offers;

      // Set up the table that allows sorting by field.
      // Credit: http://bazalt-cms.com/ng-table/example/3
      $scope.tableParams = new ngTableParams({
        page: 1,          // show first page
        count: 10,        // count per page
        sorting: {
          name: 'asc'     // initial sorting
        }
      }, {
        total: 0, // length of data
        getData: function($defer, params) {
          var data = $scope.offers;
          params.total(data.length);
          var orderedData = params.sorting() ?
                            $filter('orderBy')(data, params.orderBy()) :
                            data;
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
      $scope.tableParams.settings().$scope = $scope;
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
]);angular.module('thegrandexchange')
.controller('VerificationCtrl', [
  '$http',
  '$scope',
  '$location',
  'session',
  'users',
  function($http, $scope, $location, session, users) {
    $scope.verify = function() {
      users.verify($scope.activationCode).success(function(data) {
        if (data.success) {
          $location.path('login');
        }
        else {
          $scope.activationCode = '';
          $scope.warning = data.message;
        }
      });
    }
}])