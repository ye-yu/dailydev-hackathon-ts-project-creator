module.exports = {
  apps: [
    {
      name: 'ye-yu-backend',
      script: './dist/index.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
      },
      // Watch the dist folder for changes
      watch: ['./dist'],
      // Don't restart on these files/folders
      ignore_watch: ['node_modules', 'logs', '.git'],
      // Max instances in cluster mode
      instances: 1,
      // Auto-restart on crash
      autorestart: true,
      // Max memory before restart (500MB)
      max_memory_restart: '500M',
      // Wait for graceful shutdown (5 seconds)
      kill_timeout: 5000,
      // Log files
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Debounce restart by 1 second (in ms)
      watch_delay: 1000,
    },
  ],
};
