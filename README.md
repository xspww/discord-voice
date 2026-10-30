# Discord Voicechat Auto Join

This tool joins Discord user accounts (not bot accounts) to voice channels and keeps the accounts there. You choose the channels and the mute state in the file `.env`. After that, the tool runs without manual steps.

The tool logs in to Discord with the token of a real account. The terms of service of Discord do not allow this automation. Discord can block the account.

## Features

- The tool rejoins the voice channel on a kick, a channel move, or a disconnect.
- The tool handles several user accounts and several voice channels at the same time.
- The tool sets self mute and self deaf from the file `.env`.
- The tool works with the end-to-end encryption rules of Discord.
- The tool starts from `start.bat` on Windows or runs as a background process with PM2.

## End-to-end encryption

The DAVE protocol gives the voice calls of Discord end-to-end encryption. With end-to-end encryption, only the people inside a call decode the audio. The server of Discord cannot decode it. Since March 1, 2026, Discord allows no call without this encryption. The installed library `djs-selfbot-v13` supports the protocol, so the tool still joins the channels.

The tool joins a voice channel without a media connection. It sends no audio, so it does not need the packages opus, sodium, or ffmpeg.

## Configuration

You copy the file `.env.example` and name the copy `.env`:

```bash
cp .env.example .env
```

You open `.env` and fill the variables in this table.

| Variable | Value | Required |
| --- | --- | --- |
| `TOKEN` (alias `TOKENS`) | One or more user tokens, separated by commas | Yes |
| `CHANNEL_ID` (alias `CHANNEL_IDS`) | One or more voice channel IDs, separated by commas | Yes |
| `SELF_DEAF` | `true` or `false`. `true` deafens the user on each join. The default is `true` | No |
| `SELF_MUTE` | `true` or `false`. `true` mutes the user on each join. The default is `true` | No |

If the variables `TOKEN` or `CHANNEL_ID` are empty, the tool stops with an error in the console. The tool pairs the first token with the first channel. If you give one token only, the tool uses it for every channel.

Example for a `.env` file:

```env
# Discord user tokens, separated by commas
TOKEN=YOUR_DISCORD_TOKEN_1,YOUR_DISCORD_TOKEN_2

# Voice channel IDs, separated by commas
CHANNEL_ID=123456789012345678,987654321098765432

# Self mute and self deaf on join (true / false)
SELF_DEAF=true
SELF_MUTE=true
```

## Start

You install the packages one time in the project folder:

```bash
npm install
```

You start the tool in one of these ways:

- Double-click the file `start.bat` on Windows.
- Run `npm start` in the project folder.
- Start the background process of PM2, as in the next section.

## Run as a background process

If PM2 is not on the host, you install it first with `npm install --global pm2`. Then you start the tool with `pm2 start ecosystem.config.js`. You read the log stream with `pm2 logs discord-voicechat`.

The license of this project is MIT. The file `LICENSE` has the full text.
