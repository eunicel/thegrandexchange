// Tests

(function() {
  var connectionString = 'http://localhost:8080/';

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
})();