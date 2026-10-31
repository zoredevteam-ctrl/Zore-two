import fetch from 'node-fetch'
import { database } from '../lib/database.js'

const SECCIONES = [
    {
        "name": "نظام الويفو",
        "emoji": "💎",
        "cmds": [
            "c",
            "كولكشن",
            "هديه",
            "رول",
            "بيع"
        ]
    },
    {
        "name": "الأنمي والتفاعل",
        "emoji": "🌸",
        "cmds": [
            "رقص",
            "حضن",
            "قتل",
            "بوسه",
            "حزن",
            "ديث_نوت",
            "كيرا",
            "زواج",
            "وايفو"
        ]
    },
    {
        "name": "ترفيه وألعاب",
        "emoji": "🎮",
        "cmds": [
            "formarpareja",
            "formarpareja5",
            "هاك",
            "ذكاء",
            "شعر",
            "حجره"
        ]
    },
    {
        "name": "الاقتصاد",
        "emoji": "💰",
        "cmds": [
            "رصيد",
            "ترتيب"
        ]
    },
    {
        "name": "التحميلات",
        "emoji": "📥",
        "cmds": [
            "تطبيق",
            "يوتيوب",
            "تحميل",
            "tiktoksearch",
            "تيك_توك"
        ]
    },
    {
        "name": "ملصقات وأدوات",
        "emoji": "🔧",
        "cmds": [
            "ملصق",
            "طقس",
            "detectarsyntax",
            "جلب",
            "flux",
            "تحسين",
            "وقت",
            "ذكاء_صناعي",
            "فحص",
            "بوكيمون",
            "تذكير",
            "حفظ",
            "صوره",
            "رفع",
            "ترجم",
            "ver",
            "فتح"
        ]
    },
    {
        "name": "الذكاء الاصطناعي",
        "emoji": "🧠",
        "cmds": [
            "llama"
        ]
    },
    {
        "name": "الجروبات",
        "emoji": "👥",
        "cmds": [
            "advertencias",
            "advertir",
            "مضاد_بوت",
            "مضاد_لينك",
            "bot",
            "غلق_جروب",
            "حذف_انذار",
            "تنبيه",
            "خاملين",
            "استدعاء",
            "خروج",
            "رابط",
            "كتم",
            "تفعيل",
            "فتح_جروب",
            "هيئه",
            "الغاء_كتم"
        ]
    },
    {
        "name": "البوت الفرعي",
        "emoji": "🤖",
        "cmds": [
            "كود",
            "بوتات"
        ]
    },
    {
        "name": "الرئيسي",
        "emoji": "🏠",
        "cmds": [
            "معلومات",
            "قائمه",
            "سرعه",
            "مالك",
            "الغاء_تسجيل",
            "تسجيل"
        ]
    },
    {
        "name": "المطور",
        "emoji": "👑",
        "cmds": [
            "ارسل_تيك_توك",
            "دخول",
            "اضف_مالك",
            "مشرف_تلقائي",
            "تقييم",
            "جيب_الامر",
            "طرد_الكل",
            "معرف",
            "اعاده_تشغيل",
            "نشر",
            "تحديث"
        ]
    },
    {
        "name": "متنوعة",
        "emoji": "✨",
        "cmds": [
            "فيسبوك",
            "انستا",
            "بنترست",
            "تنزيل",
            "طرد",
            "ترقيه",
            "وضع_المشرفين",
            "newsletter",
            "قناه"
        ]
    }
]

function makeCtx() {
    return {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid:   global.newsletterJid  || '120363404822730259@newsletter',
            newsletterName:  global.newsletterName || 'Flash Bot MD',
            serverMessageId: -1
        }
    }
}

const handler = async (m, { conn, usedPrefix, prefix, args }) => {
    const p = usedPrefix || prefix || global.prefix || '.'
    try {
        const cat = (args?.[0] || '').trim()

        // ── عرض قسم واحد (عند الضغط على زر) ─────────────
        if (cat) {
            const sec = SECCIONES.find(s => s.name === cat || s.name.includes(cat))
            if (!sec) return m.reply(`❌ مفيش قسم بالاسم ده يا غالي~\nاكتب *${p}القائمة* وشوف الأقسام.`)
            const body = sec.cmds.map(c => `  ꕦ ${p}${c}`).join('\n')
            return conn.sendMessage(m.chat, {
                text: `${sec.emoji} *${sec.name}*\n\n${body}\n\n⚡ *~Flash Bot MD*`,
                contextInfo: makeCtx()
            }, { quoted: m })
        }

        // ── القائمة الرئيسية ─────────────────────────────
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

        const readMore = String.fromCharCode(8206).repeat(3000)

        const seccionesTexto = SECCIONES.map(s =>
            `*╭── ⟡ [ ${s.emoji} ${s.name} ] ⟡*\n` +
            s.cmds.map(c => `> ✧ ${p}${c}`).join('\n') +
            `\n*╰─────────────── ✦*`
        ).join('\n\n')

        const totalCmds = new Set(SECCIONES.flatMap(s => s.cmds)).size

        const menuTexto = `✦ ⋆｡°✩ قائمة 𝐅𝐋𝐀𝐒𝐇 𝐁𝐎𝐓 𝐌𝐃 ✩°｡⋆ ✦
❝ أهلاً *${m.pushName}*، ${saludo}! ${carita}
أنا *${botname}* ودي قائمتي،
اضغط على الأزرار أو اكتب الأمر. ⚡ ❞

⚡ *الأوامر:* ${totalCmds} متاح
⚡ *المستخدمين:* ${totalUsers} معروف
⚡ *المسجّلين:* ${registeredUsers} عضو
⚡ *مدة التشغيل:* ${uptime}
${readMore}
${seccionesTexto}

✦ *~Flash Bot MD* ʚɞ (´｡• ᵕ •｡\`)`.trim()

        // ── البانر ───────────────────────────────────────
        let buffer = null
        try { buffer = await global.getBannerBuffer(database.data) } catch {}
        if (!buffer) {
            try { buffer = await (await fetch(global.banner)).buffer() } catch {}
        }

        // ── أزرار الأقسام (تفتح من الداخل) ───────────────
        const interactiveButtons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💎 نظام الويفو', id: `${p}القائمة نظام الويفو` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🌸 الأنمي والتفاعل', id: `${p}القائمة الأنمي والتفاعل` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🎮 ترفيه وألعاب', id: `${p}القائمة ترفيه وألعاب` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💰 الاقتصاد', id: `${p}القائمة الاقتصاد` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📥 التحميلات', id: `${p}القائمة التحميلات` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🔧 ملصقات وأدوات', id: `${p}القائمة ملصقات وأدوات` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🧠 الذكاء الاصطناعي', id: `${p}القائمة الذكاء الاصطناعي` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👥 الجروبات', id: `${p}القائمة الجروبات` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🤖 البوت الفرعي', id: `${p}القائمة البوت الفرعي` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '🏠 الرئيسي', id: `${p}القائمة الرئيسي` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👑 المطور', id: `${p}القائمة المطور` }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✨ متنوعة', id: `${p}القائمة متنوعة` }) },
        ]

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
