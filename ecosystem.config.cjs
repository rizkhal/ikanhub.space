module.exports = {
  apps: [
    {
      name: "ikanhub-api",
      cwd: "/www/wwwroot/ikanhub.space/apps/api",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
