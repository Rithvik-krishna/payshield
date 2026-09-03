const net = require('net');

const store = new Map();

const server = net.createServer((socket) => {
  socket.on('data', (data) => {
    const raw = data.toString();

    if (/PING/i.test(raw)) {
      socket.write('+PONG\r\n');
    } else if (/COMMAND/i.test(raw)) {
      socket.write('*0\r\n');
    } else if (/INFO/i.test(raw)) {
      const info = 'redis_version:7.4.0\r\nrole:master\r\nconnected_clients:1\r\n';
      socket.write('$' + info.length + '\r\n' + info + '\r\n');
    } else if (/CLIENT/i.test(raw)) {
      socket.write('+OK\r\n');
    } else if (/SELECT/i.test(raw)) {
      socket.write('+OK\r\n');
    } else if (/SET/i.test(raw)) {
      socket.write('+OK\r\n');
    } else if (/GET/i.test(raw)) {
      socket.write('$-1\r\n');
    } else if (/DEL/i.test(raw)) {
      socket.write(':1\r\n');
    } else if (/QUIT/i.test(raw)) {
      socket.write('+OK\r\n');
      socket.end();
    } else {
      socket.write('+OK\r\n');
    }
  });

  socket.on('error', () => {});
});

server.listen(6379, '127.0.0.1', () => {
  console.log('PayShield Local Redis service listening on 127.0.0.1:6379');
});
