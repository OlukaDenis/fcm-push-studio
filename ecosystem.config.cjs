const path = require('path');

module.exports = {
  apps: [
    {
      name: 'fcm-push-api',
      cwd: path.resolve(__dirname, 'api'),
      script: path.resolve(__dirname, 'api', 'dist', 'main.js'),
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3001,
      },
      error_file: path.resolve(__dirname, 'logs', 'api-error.log'),
      out_file: path.resolve(__dirname, 'logs', 'api-out.log'),
      time: true,
    },
    {
      name: 'fcm-push-web',
      cwd: path.resolve(__dirname, 'web'),
      script: path.resolve(__dirname, 'web', 'node_modules', 'vite', 'bin', 'vite.js'),
      args: 'preview --port 5550 --host',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 5550,
      },
      error_file: path.resolve(__dirname, 'logs', 'web-error.log'),
      out_file: path.resolve(__dirname, 'logs', 'web-out.log'),
      time: true,
    },
  ],
};
