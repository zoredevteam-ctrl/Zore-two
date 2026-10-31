import { database } from '../lib/database.js'
import { createHash } from 'crypto'
import fetch from 'node-fetch'

const Reg = /^(.+)[.|]\s*([0-9]+)$/i

let handler = async (m, { conn, args, prefix }) => {
    const text = args.join(' ')
    const user = database.data.users[m.sender]
    const name2 = m.pushName || 'يا غالي'
    const zeroImg = 'https://causas-files.vercel.app/fl/9vs2.jpg'

    if (user.registered) return m.reply(
        `💗 *انت مسجّل بالفعل، يا غالي~!*\n\n🌸 لو عايز تلغي تسجيلك استخدم:\n*${prefix}unreg*`
    )

    if (!Reg.test(text)) return m.reply(
        `𖤐 *التسجيل - Flash Bot MD* 🌸\n\n*الصيغة الصحيحة:*\n${prefix}reg اسم.edad\n\n*مثال:*\n${prefix}reg ${name2}.18\n\n💗 سجّل عشان تستخدم كل مميزاتي يا غالي~!`
    )

    let [_, name, age] = text.match(Reg)
    if (!name) return m.reply('💔 الاسم مينفعش يبقى فاضي، يا غالي~')
    if (!age) return m.reply('💔 السن مينفعش يبقى فاضي، يا غالي~')
    if (name.length >= 30) return m.reply('💔 الاسم طويل أوي، يا غالي~ استخدم أقل من 30 حرف.')
    age = parseInt(age)
    if (age > 100) return m.reply('💔 السن ده كبير أوي، يا غالي~')
    if (age < 10) return m.reply('💔 انت صغير أوي على استخدام البوت، يا غالي~')

    user.name = name.trim()
    user.age = age
    user.regTime = +new Date
    user.registered = true

    const sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)

    const regbot = `𖤐 *تم التسجيل بنجاح!* 🌸\n\n👤 *الاسم:* ${name}\n🎂 *السن:* ${age} años\n🆔 *ID:* ${sn}\n\n💗 *أهلاً بيك, يا غالي~!*\n\n... الأفضل تستخدم البوت صح ولا مش هسامحك~ 💢`

    await m.react('🌸')

    let thumbBuffer = null
    try {
        const res = await fetch(zeroImg)
        thumbBuffer = Buffer.from(await res.arrayBuffer())
    } catch (e) {
        console.error('خطأ في تحميل الصورة:', e)
    }

    await conn.sendMessage(m.chat, {
        text: regbot,
        contextInfo: {
            externalAdReply: {
                title: '𝐅𝐋𝐀𝐒𝐇 𝐁𝐎𝐓 𝐌𝐃 - Registro 🌸',
                body: 'يا غالي~ 💗',
                thumbnail: thumbBuffer,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })

    await database.save()
}

handler.help = ['reg']
handler.tags = ['main']
handler.command = ['reg', 'register', 'registrar']

export default handler