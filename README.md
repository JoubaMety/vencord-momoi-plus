# vencord-momoi-plus
*Life is Kuyashi.*

A [Vencord](https://vencord.dev/) plugin that plays audio; voice lines of characters from the video game [Blue Archive](https://en.wikipedia.org/wiki/Blue_Archive) & other internet memes by their respective triggers ー their name in emotes, stickers or embeds (incl. [FakeNitro](https://vencord.dev/plugins/FakeNitro)) or as replacement for Discord's [start-up sound easter egg "Discordo"](https://discord.fandom.com/wiki/Easter_Eggs#Discordo).

## Installation
### Via standalone script
#### Windows
* You can run following script via PowerShell like this:
  ```ps
  irm "https://raw.githubusercontent.com/ddddjBlue/vencord-momoi-plus/refs/heads/main/user-install.ps1" | iem
  ```
* At the end of it, you'll be asked to choose which Discord installation to patch.
### Manually
1. Get [source code](https://github.com/Vendicated/Vencord) of Vencord.
2. In `{path-to-your-source}\src\userplugins\{folder-of-your-choice}\`: place `index.ts` and `audioData.ts`
3. With [pnpm](https://pnpm.io/installation) via terminal (Powershell and such), install dependecies
   ```ps
   pnpm install
   ```
4. Build Vencord.
   ```ps
   pnpm build
   ```
5. Inject Discord with Vencord
   ```ps
   pnpm inject
   ```
   * At the end of it, you'll be asked to choose which Discord installation to patch.
6. Enjoy.

<br>

![](https://img.shields.io/github/license/ddddjBlue/vencord-momoi-plus?style=for-the-badge
)
![](https://img.shields.io/badge/life-kuyashi-F527E4?style=for-the-badge
)
