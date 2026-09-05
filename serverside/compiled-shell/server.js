import { createServer } from 'node:http';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { Server } from 'socket.io';

const language = process.env.LANGUAGE || 'compiled';
const sourceFile = process.env.SOURCE_FILE || 'main.txt';
const compileCommand = process.env.COMPILE_COMMAND || '';
const runCommand = process.env.RUN_COMMAND || '';
const port = Number(process.env.PORT || 8010);

const httpServer = createServer();
const io = new Server(httpServer);

function commandParts(command) {
  return command.trim().split(/\s+/).filter(Boolean);
}

function run(command, cwd, socket) {
  const [executable, ...args] = commandParts(command);
  return spawn(executable, args, { cwd });
}

io.on('connection', (socket) => {
  let sessionDir;
  let child;

  socket.on('eval', async (data) => {
    try {
      if (data.init || !sessionDir) {
        sessionDir = `/tmp/sessions/${randomBytes(8).toString('hex')}`;
        await mkdir(sessionDir, { recursive: true });
        await writeFile(`${sessionDir}/${sourceFile}`, data.code || '');
      }

      const compile = compileCommand ? run(compileCommand, sessionDir, socket) : null;
      const start = () => {
        child = run(runCommand, sessionDir, socket);
        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');
        child.stdout.on('data', (output) => socket.emit('stdout', output));
        child.stderr.on('data', (error) => socket.emit('script error', { error }));
        child.on('error', (error) => socket.emit('script error', { error: error.message }));
        child.on('exit', (code, signal) => {
          socket.emit('exit', { code, signal });
        });
      };

      if (!compile) {
        start();
      } else {
        let errors = '';
        compile.stderr.setEncoding('utf8');
        compile.stderr.on('data', (error) => { errors += error; });
        compile.on('error', (error) => socket.emit('compile error', { error: error.message }));
        compile.on('exit', (code) => {
          if (code === 0) start();
          else socket.emit('compile error', { error: errors || `${language} compiler exited with code ${code}` });
        });
      }
    } catch (error) {
      socket.emit('script error', { error: error.message });
    }
  });

  socket.on('write', (data) => {
    if (child && !child.killed) child.stdin.write(data.input || '');
  });

  socket.on('disconnect', async () => {
    if (child && !child.killed) child.kill('SIGKILL');
    if (sessionDir) await rm(sessionDir, { recursive: true, force: true });
  });
});

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`${language} shell listening on ${port}`);
});
