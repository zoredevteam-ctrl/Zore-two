import fetch from 'node-fetch'
import { database } from '../lib/database.js'

const SECCIONES = [
    { name: 'نظام الويفو',       emoji: '💎', cmds: ['c', 'كولكشن', 'هديه', 'رول', 'بيع'] },
    { name: 'الأنمي والتفاعل',   emoji: '🌸', cmds: ['رقص', 'حضن', 'قتل', 'بوسه', 'حزن', 'ديث_نوت', 'كيرا', 'زواج', 'وايفو'] },
    { name: 'ترفيه وألعاب',      emoji: '🎮', cmds: ['formarpareja', 'formarpareja5', 'هاك', 'ذكاء', 'شعر', 'حجره'] },
    { name: 'الاقتصاد',          emoji: '💰', cmds: ['رصيد', 'ترتيب'] },
    { name: 'التحميلات',         emoji: '📥', cmds: ['تطبيق', 'يوتيوب', 'تحميل', 'tiktoksearch', 'تيك_توك'] },
    { name: 'ملصقات وأدوات',     emoji: '🔧', cmds: ['ملصق', 'طقس', 'detectarsyntax', 'جلب', 'flux', 'تحسين', 'وقت', 'ذكاء_صناعي', 'فحص', 'بوكيمون', 'تذكير', 'حفظ', 'صوره', 'رفع', 'ترجم', 'ver', 'فتح'] },
    { name: 'الذكاء الاصطناعي',  emoji: '🧠', cmds: ['llama'] },
    { name: 'الجروبات',          emoji: '👥', cmds: ['advertencias', 'advertir', 'مضاد_بوت', 'مضاد_لينك', 'bot', 'غلق_جروب', 'حذف_انذار', 'تنبيه', 'خاملين', 'استدعاء', 'خروج', 'رابط', 'كتم', 'تفعيل', 'فتح_جروب', 'هيئه', 'الغاء_كتم'] },
    { name: 'البوت الفرعي',      emoji: '🤖', cmds: ['كود', 'بوتات'] },
    { name: 'الرئيسي',           emoji: '🏠', cmds: ['معلومات', 'قائمه', 'سرعه', 'مالك', 'الغاء_تسجيل', 'تسجيل'] },
    { name: 'المطور',            emoji: '👑', cmds: ['ارسل_تيك_توك', 'دخول', 'اضف_مالك', 'مشرف_تلقائي', 'تقييم', 'جيب_الامر', 'طرد_الكل', 'معرف', 'اعاده_تشغيل', 'نشر', 'تحديث'] },
    { name: 'متنوعة',            emoji: '✨', cmds: ['فيسبوك', 'انستا', 'بنترست', 'تنزيل', 'طرد', 'ترقيه', 'وضع_المشرفين', 'newsletter', 'قناه'] },
]

function makeCtx() {
    return {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid:   global.newsletterJid  || '120363410090342500@newsletter',
            newsletterName:  global.newsletterName || 'Flash Bot MD',
            serverMessageId: -1
        }
    }
}

const handler = async (m, { conn, usedPrefix, prefix, args }) => {
    const p = usedPrefix || prefix || global.prefix || '.'
    try {
        // args is split on spaces, so join it back to match multi-word section names
        const cat = (args || []).join(' ').trim()

        // ── قسم واحد: نص عادي، أوامر القسم بس، بدون أزرار ─────────────
        if (cat) {
            const sec = SECCIONES.find(s => s.name === cat) ||
                        SECCIONES.find(s => s.name.includes(cat) || cat.includes(s.name))
            if (!sec) return m.reply(`❌ مفيش قسم بالاسم ده يا غالي~\nاكتب *${p}القائمة* وشوف الأقسام.`)
            const body = sec.cmds.map(c => `  ꕦ ${p}${c}`).join('\n')
            return conn.sendMessage(m.chat, {
                text: `${sec.emoji} *${sec.name}*\n\n${body}\n\n⚡ *~Flash Bot MD*\n> ارجع للقائمة: *${p}القائمة*`,
                contextInfo: makeCtx()
            }, { quoted: m })
        }

        // ── القائمة الرئيسية: أزرار بس ────────────────────────────────
        const botname         = global.botName || 'Flash Bot MD'
        const totalUsers      = Object.keys(database.data.users || {}).length
        const registeredUsers = Object.values(database.data.users || {}).filter(u => u.registered).length

        const sec2   = process.uptime()
        const uptime = `${String(Math.floor(sec2/3600)).padStart(2,'0')}:${String(Math.floor(sec2/60)%60).padStart(2,'0')}:${String(Math.floor(sec2)%60).padStart(2,'0')}`

        const hora = parseInt(new Date().toLocaleTimeString('ar-EG', {
            timeZone: 'Africa/Cairo', hour: '2-digit', hour12: false
        }))
        const [saludo, carita] =
            hora >= 5  && hora < 12 ? ['صباح الخير', '(＊^▽^＊) ☀️']  :
            hora >= 12 && hora < 18 ? ['مساء الخير', '(｡•̀ᴗ-)✧ 🌸'] :
                                      ['مساء الخير', '(◕‿◕✿) 🌙']

        const totalCmds = new Set(SECCIONES.flatMap(s => s.cmds)).size

        const menuTexto = `✦ ⋆｡°✩ قائمة 𝐅𝐋𝐀𝐒𝐇 𝐁𝐎𝐓 𝐌𝐃 ✩°｡⋆ ✦
❝ أهلاً *${m.pushName}*، ${saludo}! ${carita}
أنا *${botname}*، اختار القسم من الأزرار تحت ⚡ ❞

⚡ *الأقسام:* ${SECCIONES.length}
⚡ *الأوامر:* ${totalCmds} متاح
⚡ *المستخدمين:* ${totalUsers} معروف
⚡ *المسجّلين:* ${registeredUsers} عضو
⚡ *مدة التشغيل:* ${uptime}

✦ *~Flash Bot MD* ʚɞ (´｡• ᵕ •｡\`)`.trim()

        // ── البانر ───────────────────────────────────────
        let buffer = null
        try { buffer = await global.getBannerBuffer(database.data) } catch {}
        if (!buffer) {
            try { buffer = await (await fetch(global.banner)).buffer() } catch {}
        }

        // ── أزرار الأقسام (زر لكل قسم) ───────────────────
        const interactiveButtons = SECCIONES.map(s => ({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: `${s.emoji} ${s.name}`, id: `${p}القائمة ${s.name}` })
        }))

        const content = buffer
            ? { image: buffer, mimetype: 'image/jpeg', caption: menuTexto, interactiveButtons, contextInfo: makeCtx() }
            : { text: menuTexto, interactiveButtons, contextInfo: makeCtx() }

        await conn.sendMessage(m.chat, { ...content, mentions: [m.sender] }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('⚡ حصلت مشكلة وأنا بجهّز القائمة... جرّب تاني.')
    }
}

handler.help    = ['menu']
handler.tags    = ['main']
handler.command = ['menu', 'help', 'ayuda', 'القائمة', 'قائمة', 'اوامر', 'منيو', 'مساعدة', 'مساعده']
export default handler
