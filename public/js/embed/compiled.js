(function() {
  var language = document.body.id.replace('embed_content_', '');
  var apiKey = language + '_api';
  var socketUrl = trinket.config[apiKey];
  var code = document.getElementById('compiled-code');
  var output = document.getElementById('compiled-output');
  var run = document.getElementById('compiled-run');

  if (!code || !output || !run || !socketUrl) return;

  var parsed = new URL(socketUrl);
  var socket = io(parsed.origin, {
    path: parsed.pathname.replace(/\/$/, '') + '/socket.io/',
    transports: ['websocket', 'polling']
  });

  function append(text, className) {
    var line = document.createElement('div');
    line.textContent = text;
    if (className) line.className = className;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  socket.on('stdout', function(text) { append(text); });
  socket.on('script error', function(data) { append(data.error, 'compiled-error'); });
  socket.on('compile error', function(data) { append(data.error, 'compiled-error'); });
  socket.on('exit', function() { run.disabled = false; });
  socket.on('connect_error', function(error) { append('Connection error: ' + error.message, 'compiled-error'); });

  run.addEventListener('click', function() {
    output.textContent = '';
    run.disabled = true;
    socket.emit('run', { code: code.value });
  });

  code.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      run.click();
    }
  });
})();
