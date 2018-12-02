var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);



app.get('/', function(req, res){
  res.sendFile(__dirname+"/main.html");
});

// socket io connection. 
var users = []
io.on('connection', function(socket) {
  socket.on("CONN", function(data) {
    // set 'name' of player. 
    data['name'] = users.length;
    socket.emit("SET_NAME", data);
    // send back complete player data.
    // socket.emit("PLAYER_WITH_NAME", data);
    socket.emit("RESPONSE", users);

    io.emit("CONN", data);

    users.push(data);
  });

  socket.on("MOVE", function(data) {
    i = 0;
    if (users.length > 0) {
      while (i < users.length && data['name'] != users[i]['name']) i++;
      if (i > users.length-1) i = users.length-1;
      users[i]['top'] = data['top'];
      users[i]['left'] = data['left'];
    }
    io.emit("MOVE", data);
  });
  socket.on("NEW_COLOR", function(data) {
    i = 0;
    if (users.length > 0) {
      while (i < users.length && data['name'] != users[i]['name']) i++;
      //if (i > users.length-1) i = users.length-1;
      users[i]['color'] = data['color'];
      //console.log(users);
    }

    io.emit("NEW_COLOR", data);
  })
  socket.on("COLLISION", function(data) {
    // check if client user has overlapped with any other user.
   // console.log("player: "+data['name'] + ":: top: "+data['top']+":"+data['left'])

    users.forEach(function(v) {
      if (data['name'] != v['name'] &&
        data['left'] < v['left']+50 && 
        data['left']+50 > v['left'] &&
        data['top'] < v['top']+50 &&
        data['top']+50 > v['top']  
      ) {
        console.log("collision detected.")
        socket.emit("COLLISION", [
          v['name'],
          data['name']
        ]);
      }
    });
  })


});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

