const { spawn, execSync } = require('child_process');
const path = require('path');

const root = __dirname;
const mlDir = path.join(root, 'ml-model');
const backendDir = path.join(root, 'backend');
const frontendDir = path.join(root, 'frontend');

console.log('==================================================');
console.log('🚀 Starting Smart Crop Disease Detection System');
console.log('==================================================\n');

// Helper to kill any process currently running on a specified port
function freePort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      const pids = new Set();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && !isNaN(pid)) {
          pids.add(parseInt(pid, 10));
        }
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
        } catch (err) {
          // Ignore
        }
      }
    } else {
      try {
        execSync(`lsof -t -i:${port} | xargs kill -9`, { stdio: 'ignore' });
      } catch (err) {
        // Ignore
      }
    }
  } catch (e) {
    // Port not in use, ignore
  }
}

// Clean up ports 5000, 3000, and 5173
console.log(' Cleaning up ports (5000, 3000, 5173)...');
freePort(5000);
freePort(3000);
freePort(5173);

// Spawn ML Model API
console.log('\n Starting Flask ML API on port 5000...');
const mlProcess = spawn('python', ['app.py'], {
  cwd: mlDir,
  stdio: 'inherit',
  shell: true
});

// Spawn Node Backend API
console.log(' Starting Node.js Backend on port 3000...');
const backendProcess = spawn('node', ['index.js'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true
});

// Spawn React Frontend
console.log('💻 Starting Vite Frontend on port 5173...');
const frontendProcess = spawn('npm', ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true
});

console.log('\n==================================================');
console.log('🎉 All servers are starting up!');
console.log('👉 ML API:    http://localhost:5000');
console.log('👉 Backend:   http://localhost:3000');
console.log('👉 Frontend:  http://localhost:5173');
console.log('==================================================\n');
console.log('Press Ctrl+C to terminate all servers.');

function killProcess(child) {
  if (!child) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
    } else {
      child.kill('SIGKILL');
    }
  } catch (err) {
    // Process might already be dead
  }
}

process.on('SIGINT', () => {
  console.log('\n🧹 Shutting down all servers...');
  killProcess(mlProcess);
  killProcess(backendProcess);
  killProcess(frontendProcess);
  console.log('✅ Shutdown complete.');
  process.exit(0);
});

process.on('exit', () => {
  killProcess(mlProcess);
  killProcess(backendProcess);
  killProcess(frontendProcess);
});
