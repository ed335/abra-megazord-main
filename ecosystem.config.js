module.exports = {
  apps: [
    {
      name: 'abracann-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run start:prod',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        API_PORT: 3001,
        API_HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        API_PORT: 3001,
        API_HOST: '0.0.0.0'
      },
      error_file: './logs/pm2-backend-error.log',
      out_file: './logs/pm2-backend-out.log',
      log_file: './logs/pm2-backend-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      wait_ready: true,
      listen_timeout: 10000
    },
    {
      name: 'abracann-web',
      cwd: './web',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: ''
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: ''
      },
      error_file: './logs/pm2-web-error.log',
      out_file: './logs/pm2-web-out.log',
      log_file: './logs/pm2-web-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};
