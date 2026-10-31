let handler = async (m, { conn, args, prefix }) => {

    const text = args.join(' ').trim()

    if (!text) {
        const menu = `🌸💗 *كياااه~!!* 💗🌸\n\n` +
            `يا غالي عايز APK خاص؟ 🥰\n` +
            `قولي اسم التطبيق وأنا هجيبلك أحسن مواقع تحميله فوراً ♡\n\n` +
            `*Ejemplos:*\n` +
            `• ${prefix}apk whatsapp plus\n` +
            `• ${prefix}apk gbwhatsapp\n` +
            `• ${prefix}apk spotify premium\n` +
            `• ${prefix}apk minecraft\n` +
            `• ${prefix}apk free fire max\n\n` +
            `اكتب الأمر + الاسم وماتخلّنيش أستنى كتير, كياااه~! 💕`

        return m.reply(menu)
    }

    const q = encodeURIComponent(text)

    const texto = `🌸💗 *بحث الـ APK جاهز يا غالي!* 💗🌸\n\n` +
        `ببحث عن *"${text}"* ليك لوحدك، يا غالي الأغلى عندي~ 🥰\n\n` +
        `🌷 *اختار موقعك المفضل:*\n\n` +
        `🔸 *Uptodown* (الأأمن والأسرع)\nhttps://uptodown.com/android/search?q=${q}\n\n` +
        `🔸 *APKPure* (muchas versiones)\nhttps://apkpure.com/search?q=${q}\n\n` +
        `🔸 *APKCombo* (كل الإصدارات)\nhttps://apkcombo.com/search?q=${q}\n\n` +
        `🔸 *Aptoide* (سهل التثبيت)\nhttps://aptoide.com/search?query=${q}\n\n` +
        `حمّل من المواقع الموثوقة دي بس! لو عايزني أرشحلك أحسن نسخة أو أساعدك في حاجة تانية، قولي وأنا أطير ليك ♡\n\n` +
        `بخبّيك دايماً يا غالي... ماتعديش تاني، تمام؟ 🌷💗`

    await m.reply(texto)
}

handler.help = ['apk']
handler.tags = ['descargas']
handler.command = ['apk', 'apkd', 'apkdl', 'apks']

export default handler