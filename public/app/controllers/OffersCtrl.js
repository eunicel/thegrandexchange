angular.module('thegrandexchange')
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

      for (var i = 0; i < data.offers.length; i++) {
        data.offers[i].postedAt = new Date(data.offers[i].postedAt).toLocaleString();
      }
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
])