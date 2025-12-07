# vencord-momoi-plus
*Life is Kuyashi.*

A [Vencord](https://vencord.dev/) plugin that plays audio; voice lines of characters from the video game [Blue Archive](https://en.wikipedia.org/wiki/Blue_Archive) & other internet memes by their respective triggers ー their name in emotes, stickers or embeds (incl. [FakeNitro](https://vencord.dev/plugins/FakeNitro)) or as replacement for Discord's [start-up sound easter egg "Discordo"](https://discord.fandom.com/wiki/Easter_Eggs#Discordo).

## Installation
### Via standalone script
#### Windows (x64)
* You can run following script via PowerShell like this:
  ```ps
  iex ((New-Object Net.WebClient).DownloadString("https://raw.githubusercontent.com/ddddjBlue/vencord-momoi-plus/refs/heads/main/user-install.ps1"))
  ```
* At the end of it, you'll be asked to choose which Discord installation to patch with further instructions on how to enable plugin inside Discord.
#### Notes
* This script doesn't actually install `git`, `node` nor `pnpm`, rather it downloads binaries (and it's required helper files) & stores them in `%TEMP%` folder, circumventing having to deal with CLI installations or worse, GUI installations.
### Manually (build)
#### Prerequisites
* [`git`](https://git-scm.com/downloads)
* [`node`](https://nodejs.org/en/download)
* [`pnpm`](https://pnpm.io/installation)

1. Clone Vencord's source code repository
   ```sh
   $ git clone https://github.com/Vendicated/Vencord.git
   ```
2. Navigate to `src`, create new folder `userplugins` & clone MomoiPlus's  repository
   ```sh
   $ cd src
   $ mkdir userplugins
   $ cd userplugins
   $ git clone https://github.com/ddddjBlue/vencord-momoi-plus.git
   ```
3. Go back to root directory of Vencord's repository & install dependencies
   ```sh
   $ cd ..\..\.
   $ pnpm install
   ```
4. Build Vencord.
   ```sh
   $ pnpm build
   ```
5. Inject Discord with Vencord
   ```sh
   $ pnpm inject
   ```
   * At the end of it, you'll be asked to choose which Discord installation to patch.
6. Start Discord, go to `Settings` > `Vencord - Plugins`, find MomoiPlus and enable it, then restart Discord.
7. Enjoy!

<br>

![](https://img.shields.io/github/license/ddddjBlue/vencord-momoi-plus?style=for-the-badge
)
![](https://img.shields.io/badge/life-kuyashi-F527E4?style=for-the-badge
)
