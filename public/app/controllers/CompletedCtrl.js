angular.module('thegrandexchange')
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
      console.log('asdf');
      console.log(transaction._id);
      $http.post('api/users/' + session.name()._id + '/transactions/' + transaction._id,
      {
        text: $scope.review_content,
        score: review_score
      })
        .success(function (response) {
          if(response.success){
            console.log(response.transaction);
          } else {
            console.log('Error in adding review.');
          }
        });
    }

  }
])