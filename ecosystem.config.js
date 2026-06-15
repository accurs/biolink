module.exports = {
  apps: [
    {
      name: "portfolio",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/root/portfolio",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },
    },
    {
      name: "presence-worker",
      script: "node_modules/.bin/tsx",
      args: "worker.ts",
      cwd: "/root/portfolio",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        REDIS_URL: "redis://localhost:6379",
        DISCORD_USER_ID: "604463848526708757",
      },
    },
  ],
};
