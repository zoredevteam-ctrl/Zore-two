let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        const menu = `🌸💗 *¡KYAAAAAH~!!* 💗🌸\n\n` +
            `¿Mi Darling quiere un APK especial? 🥰\n` +
            `Dime el nombre de la aplicación y te doy los mejores sitios para descargarla al instante ♡\n\n` +
            `*Ejemplos:*\n` +
            `• ${usedPrefix + command} whatsapp plus\n` +
            `• ${usedPrefix + command} gbwhatsapp\n` +
            `• ${usedPrefix + command} spotify premium\n` +
            `• ${usedPrefix + command} minecraft\n` +
            `• ${usedPrefix + command} free fire max\n\n` +
            `¡Escribe el comando + el nombre y no me hagas esperar mucho, kyaaah~! 💕`

        return conn.sendMessage(m.chat, { text: menu, mentions: [m.sender] }, { quoted: m })
    }

    const q = encodeURIComponent(text.trim())

    const texto = `🌸💗 *¡BÚSQUEDA APK LISTA, DARLING!* 💗🌸\n\n` +
        `Buscando *"${text}"* solo para ti, mi Darling más especial~ 🥰\n\n` +
        `🌷 *Elige tu sitio favorito:*\n\n` +
        `🔸 *Uptodown* (el más seguro y rápido)\nhttps://uptodown.com/android/search?q=${q}\n\n` +
        `🔸 *APKPure* (muchas versiones)\nhttps://apkpure.com/search?q=${q}\n\n` +
        `🔸 *APKCombo* (todas las versiones)\nhttps://apkcombo.com/search?q=${q}\n\n` +
        `🔸 *Aptoide* (fácil de instalar)\nhttps://aptoide.com/search?query=${q}\n\n` +
        `¡Descarga solo de estos sitios de confianza! Si quieres que te recomiende la mejor versión o te ayude con otra cosa, solo dime y salgo volando por ti ♡\n\n` +
        `Te cuido siempre, mi Darling... no te vayas a infectar nunca, ¿okay? 🌷💗`

    await conn.sendMessage(m.chat, { 
        text: texto,
        mentions: [m.sender]
    }, { quoted: m })
}

handler.help = ['apk']
handler.tags = ['descargas']
handler.command = ['apk', 'apkd', 'apkdl', 'apks']

export default handler