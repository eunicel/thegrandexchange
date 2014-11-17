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