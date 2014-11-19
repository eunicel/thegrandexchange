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
    $scope.isBuyer = function(transaction){
      if(transaction.buyOffer.postedBy._id === session.name()._id){
        return true;
      } else if (transaction.sellOffer.postedBy._id === session.name()._id){
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
            console.log(response);
            console.log(review);
          } else {
            console.log('Error in adding review.');
          }
        });
    }

  }
])