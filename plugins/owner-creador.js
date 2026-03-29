let handler = async (m, { conn }) => {
  try {
    // 💗 Reacción estilo Zero Two
    await conn.sendMessage(m.chat, {
      react: { text: '💗', key: m.key }
    });

    // 📞 Datos del owner
    let numberOwner = '573107400303';
    let nombreOwner = '♡ 𝓐𝓪𝓻𝓸𝓶 - 𝑪𝒓𝒆𝒂𝒅𝒐𝒓 ♡';

    // 📇 vCard
    let vcardOwner = `BEGIN:VCARD
VERSION:3.0
N:${nombreOwner};;;
FN:${nombreOwner}
TEL;type=CELL;type=VOICE;waid=${numberOwner}:${numberOwner}
END:VCARD`;

    // 💬 Mensaje estilo anime
    let texto = `╭━━━〔 ♡ 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 ♡ 〕━━━⬣
┃ ❥ Aquí está mi creador
┃ ❥ Puedes hablar con él si me necesitas
┃ ❥ No seas tímido... 💗
╰━━━━━━━━━━━━━━━━⬣`;

    // 📩 Enviar mensaje
    await conn.sendMessage(m.chat, { text: texto }, { quoted: m });

    // 📇 Enviar contacto
    await conn.sendMessage(m.chat, {
      contacts: {
        displayName: nombreOwner,
        contacts: [{ vcard: vcardOwner }]
      }
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    await m.reply('♡ Ocurrió un error... inténtalo otra vez');
  }
};

handler.help = ['owner'];
handler.tags = ['main'];
handler.command = ['owner', 'creator', 'creador', 'dueño'];

export default handler;