import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs';

const scriptPath = fileURLToPath(import.meta.url);
watchFile(scriptPath, () => {
  unwatchFile(scriptPath);
  console.log(chalk.greenBright("✅ Archivo 'settings.js' recargado automáticamente."));
  import(`${scriptPath}?update=${Date.now()}`);
});

global.groupLink = 'https://chat.whatsapp.com/tu-link-grupo';  
global.communityLink = 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y';
global.channelLink = 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y';
global.gitHubRepo = 'https://github.com/zoredevteam-ctrl/Zore-two.git';
global.emailContact = 'Zoredevteam@gmail.com';

global.newsChannels = {
  primary: '120363401404146384@newsletter',
};

global.apiConfigs = {
  stellar: { baseUrl: 'https://api.stellarwa.xyz', key: 'YukiWaBot', extraKey: '1bcd4698ce6c75217275c9607f01fd99' },
  xyro: { baseUrl: 'https://api.xyro.site', key: null },
  yupra: { baseUrl: 'https://api.yupra.my.id', key: null },
  vreden: { baseUrl: 'https://api.vreden.web.id', key: null },
  delirius: { baseUrl: 'https://api.delirius.store', key: null },
  siputzx: { baseUrl: 'https://api.siputzx.my.id', key: null },
  nekolabs: { baseUrl: 'https://api.nekolabs.web.id', key: null },
  ootaizumi: { baseUrl: 'https://api.ootaizumi.web.id', key: null },
  apifaa: { baseUrl: 'https://api-faa.my.id', key: null },
};

global.authorizedOwners = [
  '573135180876',
  '524444854390',
  '59175850453',
  '584242773183',
  '5493863447787',
  '573107400303',
];

global.botName = 'Zero Two';
global.botText = '❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 ❖ - power by Jose';
global.devCredit = '© power by Jose';
global.authorCredit = '© power by Jose';
global.botTag = '✰ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 ✰ (•̀ᴗ•́)و';
global.currencySymbol = 'Stamps';
global.botEmoji = '💗';

global.suitTags = [];
global.premiumUsers = [];

global.bannerUrl = 'https://wallpapers.com/images/hd/zero-two-pictures-1j4mw86y6ncyfvj2.jpg';
global.iconUrl = 'https://wallpapers.com/images/featured/zero-two-pictures-j468lgu4oedsxfla.jpg';
global.catalogImage = null;

global.libName = 'Baileys Multi Device';
global.botVersion = '^2.0 - Latest';
global.qrName = '✯ Zero Two ✰';
global.sessionFolder = './Sessions/Owner';
global.jadiFolder = 'JadiBots';
global.jadiMode = false;
```