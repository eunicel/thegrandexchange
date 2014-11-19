angular.module('thegrandexchange')
.controller('CompletedCtrl',[
  '$scope',
  'users',
  'session',
  function($scope, users, session) {
    users.getTransactions(session.name()._id).then(function (response) {
      transactions = response.data.transactions;
      for (var i = 0; i < transactions.length; i++) {
        console.log(transactions[i]);
        if(transactions[i].buyOffer.postedBy._id === session.name()._id){
          transactions[i].isBuyer = true;
        } else if (transactions[i].sellOffer.postedBy._id === session.name()._id){
          transactions[i].isBuyer = false;
        }
      }
      $scope.transactions = response.data.transactions;
    });

    $scope.review = function(transaction) {
      var review_score = 0;
      // completed if checkbox is checked
      if(transaction.completed){
        review_score = 1;
      } else {
        review_score = -1;
      }
      var newReview = {
        text: transaction.review_content,
        score: review_score
      };
      console.log(newReview);
      users.postReview(session.name()._id, transaction._id, newReview).then(function (response) {
        console.log(response.data);
        if(response.data.success) {
          //
        } else {
          console.log('Error in adding review.');
        }
      });
    };
  }
])