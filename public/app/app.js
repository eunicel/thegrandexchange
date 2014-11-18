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
  $urlRouterProvider.otherwise('login');
}])
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
}])
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
}])
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
});