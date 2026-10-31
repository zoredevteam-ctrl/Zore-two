import fs from 'fs'
import fetch from 'node-fetch'
import { database } from '../lib/database.js'

const handler = async (m, { conn, usedPrefix, prefix }) => {
    try {
        const botname = global.botname || global.botName || 'Flash Bot MD'

        // ── الإحصائيات ───────────────────────────────
        const totalUsers      = Object.keys(database.data.users || {}).length
        const registeredUsers = Object.values(database.data.users || {}).filter(u => u.registered).length

        // ── عدّ الأوامر بدون تكرار ───────────────────
        let totalCmds = 0
        try {
            const pluginFiles = fs.readdirSync('./plugins').filter(f => f.endsWith('.js'))
            const allCmds = new Set()
            for (const file of pluginFiles) {
                try {
                    const plugin = (await import(`../plugins/${file}`)).default
                    const cmds = plugin?.command || [file.replace('.js', '')]
                    for (const cmd of (Array.isArray(cmds) ? cmds : [cmds])) allCmds.add(cmd)
                } catch {}
            }
            totalCmds = allCmds.size
        } catch {}

        // ── مدة التشغيل ──────────────────────────────
        const sec = process.uptime()
        const h   = Math.floor(sec / 3600)
        const min = Math.floor(sec / 60) % 60
        const s   = Math.floor(sec) % 60
        const uptime = `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}`

        // ── التحية حسب الوقت ─────────────────────────
        const hora = parseInt(new Date().toLocaleTimeString('ar-EG', {
            timeZone: 'Africa/Cairo', hour: '2-digit', hour12: false
        }))
        let saludo, carita
        if      (hora >= 5  && hora < 12) { saludo = 'صباح الخير';  carita = '(＊^▽^＊) ☀️' }
        else if (hora >= 12 && hora < 18) { saludo = 'مساء الخير';  carita = '(｡•̀ᴗ-)✧ ⚡' }
        else                              { saludo = 'مساء الخير';  carita = '(◕‿◕✿) 🌙'   }

        // ── حركة "اقرأ المزيد" ───────────────────────
        const readMore = String.fromCharCode(8206).repeat(4000)

        // ── الأقسام ──────────────────────────────────
        const p = usedPrefix || prefix || global.prefix || '.'
        const seccionesTexto = `*╭── ⟡ [ ✦ الأنمي والتفاعل ] ⟡*
> ✧ ${p}رقص
> ✧ ${p}حضن
> ✧ ${p}قتل
> ✧ ${p}بوسة
> ✧ ${p}حزن
> ✧ ${p}وايفو
> ✧ ${p}زواج
*╰─────────────── ✦*

*╭── ⟡ [ ✦ نظام الويفو ] ⟡*
> ✧ ${p}رول — صيد ويفو
> ✧ ${p}كولكشن — مجموعتك
> ✧ ${p}هدية — اهدي ويفو
> ✧ ${p}بيع — بيع ويفو
*╰─────────────── ✦*

*╭── ⟡ [ ✦ ترفيه وألعاب ] ⟡*
> ✧ ${p}ديث_نوت
> ✧ ${p}كيرا
> ✧ ${p}زواج / ${p}شيب
> ✧ ${p}شعر
> ✧ ${p}حجرة
> ✧ ${p}هاك
> ✧ ${p}ذكاء
*╰─────────────── ✦*

*╭── ⟡ [ ✦ الاقتصاد ] ⟡*
> ✧ ${p}رصيد — رصيدك
> ✧ ${p}ترتيب — المتصدرين
*╰─────────────── ✦*

*╭── ⟡ [ ✦ التحميلات ] ⟡*
> ✧ ${p}تيك_توك
> ✧ ${p}فيسبوك
> ✧ ${p}انستا
> ✧ ${p}بنترست
> ✧ ${p}تحميل
> ✧ ${p}تطبيق
*╰─────────────── ✦*

*╭── ⟡ [ ✦ ملصقات وأدوات ] ⟡*
> ✧ ${p}ملصق
> ✧ ${p}صورة
> ✧ ${p}فحص
> ✧ ${p}رفع
> ✧ ${p}طقس
> ✧ ${p}تحسين
> ✧ ${p}ترجم
> ✧ ${p}شوف
> ✧ ${p}تذكير
> ✧ ${p}حفظ
> ✧ ${p}جلب
*╰─────────────── ✦*

*╭── ⟡ [ ✦ الذكاء الاصطناعي ] ⟡*
> ✧ ${p}ذكاء_صناعي
*╰─────────────── ✦*

*╭── ⟡ [ ✦ الجروبات ] ⟡*
> ✧ ${p}مضاد_بوت
> ✧ ${p}مضاد_لينك
> ✧ ${p}استدعاء / ${p}هيئة
> ✧ ${p}خاملين
> ✧ ${p}كتم / ${p}الغاء_كتم
> ✧ ${p}فتح_جروب / ${p}غلق_جروب
> ✧ ${p}رابط
> ✧ ${p}تنبيه
> ✧ ${p}انذار / ${p}انذارات
> ✧ ${p}حذف_انذار
> ✧ ${p}خروج
> ✧ ${p}تفعيل
> ✧ ${p}تنزيل / ${p}ترقية
> ✧ ${p}طرد
> ✧ ${p}وضع_المشرفين
*╰─────────────── ✦*

*╭── ⟡ [ ✦ البوت الفرعي ] ⟡*
> ✧ ${p}كود
> ✧ ${p}بوتات
*╰─────────────── ✦*

*╭── ⟡ [ ✦ الرئيسي ] ⟡*
> ✧ ${p}القائمة / ${p}اوامر
> ✧ ${p}معلومات
> ✧ ${p}تسجيل / ${p}الغاء_تسجيل
> ✧ ${p}مالك
> ✧ ${p}وقت
> ✧ ${p}سرعة
> ✧ ${p}تقرير
*╰─────────────── ✦*

*╭── ⟡ [ ✦ المطور ] ⟡*
> ✧ ${p}اضف_مالك
> ✧ ${p}مشرف_تلقائي
> ✧ ${p}جيب_الامر
> ✧ ${p}دخول
> ✧ ${p}طرد_الكل
> ✧ ${p}معرف
> ✧ ${p}قناة
> ✧ ${p}اعادة_تشغيل
> ✧ ${p}تحديث
> ✧ ${p}نشر
*╰─────────────── ✦*`

        // ── نص القائمة ───────────────────────────────
        const menuTexto = `✦ ⋆｡°✩ قائمة 𝐅𝐋𝐀𝐒𝐇 𝐁𝐎𝐓 𝐌𝐃 ✩°｡⋆ ✦
❝ أهلاً *${m.pushName}*، ${saludo}! ${carita}
أنا *${botname}* ودي قائمتي،
اتمنى تستعملها صح... ⚡ ❞

⚡ *الأوامر:* ${totalCmds} متاح
⚡ *المستخدمين:* ${totalUsers} معروف
⚡ *المسجّلين:* ${registeredUsers} عضو
⚡ *مدة التشغيل:* ${uptime}
${readMore}
${seccionesTexto}

✦ *~Flash Bot MD* ʚɞ (´｡• ᵕ •｡\`)`.trim()

        // ── البانر ───────────────────────────────────
        let buffer = null
        try { buffer = await global.getBannerBuffer(database.data) } catch {}
        if (!buffer) {
            try {
                const response = await fetch(global.banner)
                buffer = await response.buffer()
            } catch {}
        }

        // ── أزرار سريعة ──────────────────────────────
        const interactiveButtons = [
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '⚡ القائمة', id: '.القائمة' }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '👑 المطور', id: '.مالك' }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '📢 القناة', id: '.قناة' }) },
            { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '💰 رصيدي', id: '.رصيد' }) },
        ]

        const ctx = {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid:   global.newsletterJid  || '120363404822730259@newsletter',
                newsletterName:  global.newsletterName || 'Flash Bot MD',
                serverMessageId: -1
            }
        }

        const content = buffer
            ? { image: buffer, mimetype: 'image/jpeg', caption: menuTexto, interactiveButtons, contextInfo: ctx }
            : { text: menuTexto, interactiveButtons, contextInfo: ctx }

        await conn.sendMessage(m.chat, { ...content, mentions: [m.sender] }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('⚡ حصلت مشكلة وأنا بجهّز القائمة... جرّب تاني.')
    }
}

handler.help    = ['menu', 'القائمة', 'اوامر']
handler.tags    = ['main']
handler.command = ['menu', 'help', 'ayuda', 'القائمة', 'قائمة', 'اوامر', 'منيو', 'مساعدة', 'مساعده']
export default handler
