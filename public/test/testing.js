// Tests

(function() {
  var connectionString = 'http://localhost:8080/api/';
  var testuserid = "546a7c7e0fe86ceb5355f66a"; //User id for eunicel@mit.edu
  var testitemid = "546aa345e008498357e78a60";

  // create user
  asyncTest('create user', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'users',
      dataType: 'json',
      data: {
        firstName: 'Eunice',
        lastName: 'Lin',
        email: 'eunicel@mit.edu',
        password: 'asdf'
      },
      success : function(data) {
        console.log(data);
        ok(data.success);
        start();
      },
      failure : function(err) {
        console.log('Test failed with error: ' + err);
      }
    });
  });

  // get user
  asyncTest('get user', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'users',
      dataType: 'json',
      data: {
        firstName: 'Ami',
        lastName: 'Suzuki',
        email: 'asuzuki@mit.edu',
        password: 'asdf'
      },
      success : function(data) {
        var userid = data.user._id;
        $.ajax({
          type: 'GET',
          url: connectionString + 'users/' + userid,
          dataType: 'json',
          data: {},
          success: function(data){
            $.ajax({
              type: 'GET',
              url: connectionString + 'users/' + userid + '/transactions',
              dataType: 'json',
              data: {},
              success: function(data){
                console.log(data);
                ok(data.success);
                start();
              },
              failure: function(err){
                console.log("Failed to get user transactions:"+err);
              }
            });
          },
          failure: function(err){
            console.log("Failed to get user:"+err);
          }
        });
      },
      failure : function(err) {
        console.log('Failed to Create User: ' + err);
      }
    });
  });
  var item_id;

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
      success: function(data){
        console.log(data);
        item_id = data.item._id;
        ok(data.success);
        start();
      },
      failure: function(err){
        console.log('Failed to create item with error: ' + err);
      }
    });
  });

  // get item by id
  asyncTest('get item by id', function(){
    $.ajax({
      type: 'GET',
      url: connectionString + 'items/' + item_id,
      dataType: 'json',
      success: function(data){
        console.log(data);
        ok(data.success);
        start();
      },
      failure: function(err){
        console.log('Failed to get user by id.');
      }
    });
  });

  // create offer
  asyncTest('create offer', function(){
    var date = new Date();
    var user = {
      firstName: 'Eunice',
      lastName: 'Lin',
      email: 'eunicel@mit.edu',
      password: 'asdf'
    }
    $.ajax({
      type: 'POST',
      url: connectionString + 'items/' + item_id +'/offers',
      dataType: 'json',
      data: {
        postedBy: "546a7c7e0fe86ceb5355f66a",
        postedAt: date,
        price: 5.5,
        type: 'buy'
      },
      success: function(data){
        console.log(data);
        ok(data.success);
        start();
      },
      failure : function(err) {
        console.log('Test failed with error: ' + err);
      }
    });
  });

// get user transactions
/*asyncTest('get user transactions', function() {
  $.ajax({
    type: 'GET',
    url: connectionString + 'users/' + testuserid + '/transactions',
    dataType: 'json',
    data: {},
    success: function(data){
      console.log(data);
      ok(data.success);
      start();
    },
    failure: function(err){
      console.log("Failed to get user transactions:"+err);
    }
  });
});*/



})();