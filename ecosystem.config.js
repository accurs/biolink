module.exports = {
  apps: [
    {
      name: "portfolio",
      script: "bun",
      args: "run start",
      cwd: "/root/biolink",
      interpreter: "none",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 8080,
        REDIS_URL: "redis://localhost:6379",
      },
    },
    {
      name: "presence-worker",
      script: "bun",
      args: "run dev:worker",
      cwd: "/root/biolink",
      interpreter: "none",
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
