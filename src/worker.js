const arr = [];

onconnect = (e = {}) => {
  console.log('(widget.worker) Connected');
  const { ports = [] } = e;
  const [port] = ports;

  arr.push(port);

  port.onmessage = (event = {}) => {
    const { data } = event;
    console.log('(widget.worker) Received a message.');

    if (data) {
      if (data.action && data.action === 'close') {
        console.log('(widget.worker) Closing');
        port.close();
      } else {
        console.log('(widget.worker) Posting: ', data);
        arr.forEach(p => {
          p.postMessage(data);
        });
      }
    }
  };

  port.start();
};
