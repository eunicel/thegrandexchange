angular.module('thegrandexchange')
.controller('CompletedCtrl',[
  '$scope',
  'users',
  'session',
  function($scope, users, session) {
    users.getTransactions(session.name()._id).then(function (response) {
      var transactions = response.data.transactions;
      var displayed_transactions = [];
      for (var i = 0; i < transactions.length; i++) {
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
      users.postReview(session.name()._id, transaction._id, newReview).then(function (response) {
        console.log(response);
        if (response.data.success) {
          for (var i = 0; i < $scope.transactions.length; i++) {
            if ($scope.transactions[i]._id === transaction._id) {
              $scope.transactions.splice(i, 1);
              return;
            }
          }
        } else {
        }
      });
    };
  }
])