module.exports = {
  apps: [
    {
      name: "discord-voicechat",
      script: "./src/index.js",
      watch: false,
      autorestart: true,
      max_restarts: 10,
    }
  ]
};
