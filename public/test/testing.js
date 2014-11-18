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

  // get user transactions
  asyncTest('get user transactions', function() {
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
  });

  // create item
  asyncTest('create item', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'items',
      dataType: 'json',
      data: {
        name: 'Clicker',
        description: 'clicks'
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

})();