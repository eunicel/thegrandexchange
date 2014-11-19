angular.module('thegrandexchange')
.controller('CompletedCtrl',[
  '$scope',
  'users',
  'session',
  function($scope, users, session) {
    users.getTransactions(session.name()._id).then(function (response) {
        $scope.transactions = response.data.transactions;
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
      users.postReview(session.name()._id, transaction._id, review).then(function (response) {
        if(response.success){
          //
        } else {
          console.log('Error in adding review.');
        }
      });
    }
  }
])