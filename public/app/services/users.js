angular.module('thegrandexchange')
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
    },
    send: function(userEmail){
      return $http.post('/api/users/' + userEmail + '/send');
    }
  };
}])