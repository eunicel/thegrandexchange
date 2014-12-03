// Tests

(function() {
  var connectionString = 'http://localhost:8080/api/';

  var userid;
  // login
  asyncTest('login', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'sessions',
      dataType: 'json',
      data: {
        username: 'gdu@mit.edu',
        password: 'asdf'
      },
      success: function(data) {
        ok(data.success);
        userid = data.userID;
        start();
      },
      failure: function(err) {
        console.log('Failed to login: ' + err);
      }
    });
  });

  // get user
  asyncTest('get user', function() {
    $.ajax({
      type: 'GET',
      url: connectionString + 'users/' + userid,
      dataType: 'json',
      success: function(data) {
        ok(data.success);
        strictEqual(data.user.email, 'gdu@mit.edu');
        start();
      },
      failure: function(err) {
        console.log('Failed to get user: ' + err);
      }
    });
  });

  var itemid;
  // create item
  asyncTest('create item', function(){
    $.ajax({
      type: 'POST',
      url: connectionString + 'items',
      dataType: 'json',
      data: {
        name: 'clicker',
        description: 'this is a description'
      },
      success: function(data) {
        itemid = data.item._id;
        ok(data.success);
        start();
      },
      failure: function(err) {
        console.log('Failed to create item: ' + err);
      }
    });
  });

  // get item by id
  asyncTest('get item by id', function(){
    $.ajax({
      type: 'GET',
      url: connectionString + 'items/' + itemid,
      dataType: 'json',
      success: function(data) {
        strictEqual(data.item.name, 'clicker');
        ok(data.success);
        start();
      },
      failure: function(err) {
        console.log('Failed to get item by id: ' + err);
      }
    });
  });

  // create offer
  asyncTest('create offer', function() {
    var date = new Date();
    $.ajax({
      type: 'POST',
      url: connectionString + 'items/' + itemid + '/offers',
      dataType: 'json',
      data: {
        postedBy: userid,
        postedAt: date,
        price: 5.5,
        minReputation: 3,
        type: 'buy'
      },
      success: function(data) {
        strictEqual(data.message, 'No match');
        start();
      },
      failure : function(err) {
        console.log('Failed to create offer: ' + err);
      }
    });
  });

  // get offers
  asyncTest('get offers', function() {
    $.ajax({
      type: 'GET',
      url: connectionString + 'items/' + itemid + '/offers',
      dataType: 'json',
      success: function(data) {
        ok(data.success);
        var found = false;
        for (var i = 0; i < data.offers.length; i++) {
          if (data.offers[i].price === 5.5) {
            found = true;
            break;
          }
        }
        ok(found);
        start();
      },
      failure : function(err) {
        console.log('Failed to get offer: ' + err);
      }
    });
  });

  // add flag
  asyncTest('flag item', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'items/' + itemid + '/flags',
      dataType: 'json',
      data: {},
      success: function(data) {
        ok(data.success);
        strictEqual(data.item.flags.length, 1);
        start();
      },
      failure: function(err) {
        console.log('Failed to flag item: ' + err);
      }
    });
  });

  // logout
  asyncTest('logout', function() {
    $.ajax({
      type: 'DELETE',
      url: connectionString + 'sessions',
      dataType: 'json',
      data: {},
      success: function(data) {
        ok(data.success);
        start();
      },
      failure: function(err) {
        console.log('Failed to logout: ' + err);
      }
    });
  });

  // login after logout
  asyncTest('login after logout', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'sessions',
      dataType: 'json',
      data: {
        username: 'eunicel@mit.edu',
        password: 'asdf'
      },
      success: function(data) {
        ok(data.success);
        userid = data.userID;
        start();
      },
      failure: function(err) {
        console.log('Failed to login: ' + err);
      }
    });
  });

  var transactionid;
  // create matching offer
  asyncTest('create matching offer', function() {
    var date = new Date();
    $.ajax({
      type: 'POST',
      url: connectionString + 'items/' + itemid + '/offers',
      dataType: 'json',
      data: {
        postedBy: userid,
        postedAt: date,
        price: 4.2,
        minReputation: 3,
        type: 'sell'
      },
      success: function(data) {
        ok(data.success);
        transactionid = data.transaction._id;
        start();
      },
      failure : function(err) {
        console.log('Failed to create offer: ' + err);
      }
    });
  });

  // check the transaction that was created
  asyncTest('get transaction', function() {
    var date = new Date();
    $.ajax({
      type: 'GET',
      url: connectionString + 'users/' + userid + '/transactions/' + transactionid,
      dataType: 'json',
      success: function(data) {
        ok(data.success);
        strictEqual(data.transaction.price, 5.5);
        start();
      },
      failure : function(err) {
        console.log('Failed to get transaction: ' + err);
      }
    });
  });

  // add a review to the transaction
  asyncTest('review transaction', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'users/' + userid + '/transactions/' + transactionid,
      dataType: 'json',
      data: {
        text: 'blah',
        score: 5
      },
      success: function(data) {
        ok(data.success);
        ok(data.transaction.sellerRated);
        start();
      },
      failure : function(err) {
        console.log('Failed to review transaction: ' + err);
      }
    });
  });

  // add second flag
  asyncTest('second flag item', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'items/' + itemid + '/flags',
      dataType: 'json',
      data: {},
      success: function(data) {
        ok(data.success);
        strictEqual(data.item.flags.length, 2);
        start();
      },
      failure: function(err) {
        console.log('Failed to flag item: ' + err);
      }
    });
  });

  // logout and login
  asyncTest('logout and login', function() {
    $.ajax({
      type: 'DELETE',
      url: connectionString + 'sessions',
      dataType: 'json',
      data: {},
      success: function(data) {
        ok(data.success);
        $.ajax({
          type: 'POST',
          async: false,
          url: connectionString + 'sessions',
          dataType: 'json',
          data: {
            username: 'jrsun@mit.edu',
            password: 'asdf'
          },
          success: function(data) {
            ok(data.success);
            start();
          },
          failure: function(err) {
            console.log('Failed to login: ' + err);
          }
        });
      },
      failure: function(err) {
        console.log('Failed to logout: ' + err);
      }
    });
  });

  // item should be deleted after third flag
  asyncTest('flag item and delete', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'items/' + itemid + '/flags',
      dataType: 'json',
      data: {},
      success: function(data) {
        ok(data.success);
        $.ajax({
          type: 'GET',
          url: connectionString + 'items/' + itemid,
          dataType: 'json',
          success: function(data) {
            strictEqual(data.success, false);
            start();
          },
          failure: function(err) {
            console.log('Item was not deleted: ' + err);
          }
        });
      },
      failure: function(err) {
        console.log('Failed to flag item: ' + err);
      }
    });
  });

})();