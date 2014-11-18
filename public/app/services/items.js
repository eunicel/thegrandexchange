angular.module('thegrandexchange')
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