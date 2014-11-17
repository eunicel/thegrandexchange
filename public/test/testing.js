/**
 * Authors: Rujia Zha, George Du
 */

(function() {
  var connectionString = 'http://teammotivate-dug.rhcloud.com/';
  // var connectionString = 'http://localhost:8080/';

  asyncTest('creating the same user again', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'users',
      dataType: 'json',
      data: { username: 'testuser', password: 'asdfjkll' },
      success : function(data) {
        console.log(data);
        ok(!data.success);
        start();
      },
      failure : function(err) {
        console.log('Test failed with error: ' + err);
      }
    });
  });

  asyncTest('logging in user', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'sessions',
      dataType: 'json',
      data: { username: 'testuser', password: 'asdfjkll' },
      success : function(data) {
        console.log(data);
        ok(data.success);
        start();
      },
      failure : function(err) {
        console.log('Test failed with error : ' + err);
      }
    });
  });

  asyncTest('listing the users', function() {
    $.ajax({
      type: 'GET',
      url: connectionString + 'users',
      dataType: 'json',
      success : function(data) {
        console.log(data);
        var userExists = false;
        for (var i = 0; i<data.length; i++) {
          if (data[i].username === 'testuser') {
            userExists = true;
          }
        }
        ok(userExists);
        start();
      },
      failure : function(err) {
        console.log('Test failed with error : ' + err);
      }
    });
  });

  var projectID = '';

  asyncTest('creating a new project', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'projects/',
      dataType: 'json',
      data: { name: 'bake', description: 'birthday', users: ['rujia'] },
      success : function(data) {
        console.log(data);
        ok(data.success);
        projectID = data.id;
        start();
      },
      failure : function(err) {
        console.log('Test failed with error : ' + err);
      }
    });
  });

  asyncTest('getting list of projects associated with user', function() {
    $.ajax({
      type: 'GET',
      url: connectionString + 'projects/',
      dataType: 'json',
      success : function(data) {
        console.log(data);
        ok(data.success);
        equal(data.projects.filter(function(v) {return v._id === projectID})[0].name, 'bake');
        start();
      },
      failure : function(err) {
        console.log('Test failed with error : ' + err);
      }
    });
  });

  asyncTest('getting a specified project', function() {
    $.ajax({
      type: 'GET',
      url: connectionString + 'projects/' + projectID,
      dataType: 'json',
      success : function(data) {
        console.log(data);
        ok(data.success);
        equal(data.project.name, 'bake');
        start();
      },
      failure : function(err) {
        console.log('Test failed with error : ' + err);
      }
    });
  });

  asyncTest('editing a specified project', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'projects/' + projectID,
      dataType: 'json',
      data: { leader: 'testuser', name: 'bake', description: 'birthday party', users: ['rujia'] },
      success : function(data) {
        console.log(data);
        ok(data.success);
        start();
      },
      failure : function(err) {
        console.log('Test failed with error : ' + err);
      }
    });
  });

  var taskID = '';

  asyncTest('create a new task for a specified project', function() {
    $.ajax({
      type: 'POST',
      url: connectionString + 'projects/' + projectID + '/tasks',
      dataType: 'json',
      data: { assignee: 'testuser', description: 'todo', etc: 5, deadline: 'October 13, 2014 11:13:00' },
      success : function(data) {
        console.log(data);
        ok(data.success);
        start();
      },
      failure : function(err) {
        console.log('Test failed with error : ' + err);
      }
    });
  });

  asyncTest('get set of tasks assigned to the user for a specified project', function() {
    $.ajax({
      type: 'GET',
      url: connectionString + 'projects/' + projectID + '/tasks',
      dataType: 'json',
      success : function(data) {
        console.log(data);
        ok(data.success);
        equal(data.tasks[0].description, 'todo');
        taskID = data.tasks[0]._id;
        start();
      },
      failure : function(err) {
        console.log('Test failed with error : ' + err);
      }
    });
  });

  asyncTest('getting a specified task', function() {
    $.ajax({
      type: 'GET',
      url: connectionString + 'projects/' + projectID + '/tasks/' + taskID,
      dataType: 'json',
      success : function(data) {
        console.log(data);
        ok(data.success);
        equal(data.task.description, 'todo');
        start();
      },
      failure : function(err) {
        console.log('Test failed with error : ' + err);
      }
    });
  });

  asyncTest('editing a specified task', function() {
    $.ajax({
      type: 'PUT',
      url: connectionString + 'projects/' + projectID + '/tasks/' + taskID,
      dataType: 'json',
      data: { assignee: 'testuser', description: 'todo', completion: 2, etc: 5, deadline: 'October 16, 2014 11:13:00' },
      success : function(data) {
        console.log(data);
        ok(data.success);
        start();
      },
      failure : function(err) {
        console.log('Test failed with error : ' + err);
      }
    });
  });

  asyncTest('deleting a specified task', function() {
    $.ajax({
      type: 'DELETE',
      url: connectionString + 'projects/' + projectID + '/tasks/' + taskID,
      dataType: 'json',
      success : function(data) {
        console.log(data);
        ok(data.success);
        start();
      },
      failure : function(err) {
        console.log('Test failed with error : ' + err);
      }
    });
  });

  asyncTest('deleting a specified project', function() {
    $.ajax({
      type: 'DELETE',
      url: connectionString + 'projects/' + projectID,
      dataType: 'json',
      success : function(data) {
        console.log(data);
        ok(data.success);
        start();
      },
      failure : function(err) {
        console.log('Test failed with error : ' + err);
      }
    });
  });
})();