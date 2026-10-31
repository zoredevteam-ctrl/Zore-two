// ─── EVENTO: Promote / Demote ─────────────────────────────────────────────────
// Carpeta: events/group-promote-demote.js

export const event = 'group-participants.update'

const getThumb = async () => {
    try {
        if (!global.icon) return null
        const res = await fetch(global.icon)
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const makeCtx = (thumb) => ({
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid:   global.newsletterJid,
        serverMessageId: '',
        newsletterName:  global.newsletterName
    },
    externalAdReply: {
        title:                 global.botName  || 'Flash Bot MD',
        body:                  global.botText  || 'يا غالي~ 💗',
        mediaType:             1,
        thumbnail:             thumb,
        renderLargerThumbnail: false,
        sourceUrl:             global.rcanal  || ''
    }
})

// ── Textos promote ────────────────────────────────────────────────────────────

const PROMOTE_MSGS = (num, groupName) => [

`*ꕥ👑* مملكة *${groupName}* عندها حارس جديد!
> ✰ @${num} اتوّج كـ *أدمن* المكان ده~
> ꕥ اتمنى تستخدم سلطتك صح، يا غالي... ولا أنا نفسي هشيلها منك 💗`,

`*ꕥ🌸* النجوم اتكلمت في *${groupName}*~
> ✰ @${num} بقى من المختارين.
> ꕥ *أدمن* من اللحظة دي. ماتخيّبش أملي 💗`,

`*ꕥ✨* اتمنح لقب جديد في *${groupName}*
> ✰ @${num} — أهلاً بيك في رتبة *Admin.*
> ꕥ المملكة بتثق فيك... ، أنا كمان أظن 💗`,

`*ꕥ💎* انتباه يا مواطنين *${groupName}*!
> ✰ @${num} اترقّى لـ *أدمن.*
> ꕥ خلي بالك من المكان ده ولا هتتحاسب معايا~ 💗`,

]

// ── Textos demote ─────────────────────────────────────────────────────────────

const DEMOTE_MSGS = (num, groupName) => [

`*ꕥ😔* مملكة *${groupName}* اتكلمت...
> ✰ @${num} اتعزل من منصب *أدمن.*
> ꕥ كده الدنيا يا غالي, السلطة مش للأبد 💔`,

`*ꕥ😞* أوقات صعبة في *${groupName}*~
> ✰ @${num} مبقاش شايل لقب *Admin.*
> ꕥ اتمنى تكون اتعلمت حاجة من التجربة دي... 💔`,

`*ꕥ💔* العرش اتغير في *${groupName}*
> ✰ @${num} اتشال من منصب *أدمن.*
> ꕥ بدون زعل يا غالي. كده المملكة دي بتشتغل~ 💔`,

`*ꕥ😤* قرارات مملكة *${groupName}* نهائية.
> ✰ @${num} خسر رتبته *Admin.*
> ꕥ نعمل إيه... أنا كمان مش قادر أعمل حاجة 💔`,

]

// ── Handler ───────────────────────────────────────────────────────────────────

export const run = async (conn, update) => {
    try {
        const { id, participants, action } = update
        if (!id?.endsWith('@g.us')) return
        if (action !== 'promote' && action !== 'demote') return

        let groupName = id
        try {
            const meta = await conn.groupMetadata(id)
            groupName = meta.subject || id
        } catch {}

        const thumb = await getThumb()
        const ctx   = makeCtx(thumb)

        for (const participant of participants) {
            const num     = participant.split('@')[0]
            const mention = [participant]

            const msgs = action === 'promote'
                ? PROMOTE_MSGS(num, groupName)
                : DEMOTE_MSGS(num, groupName)

            const texto = msgs[Math.floor(Math.random() * msgs.length)]

            await conn.sendMessage(id, {
                text:        texto,
                mentions:    mention,
                contextInfo: ctx
            })

            await conn.sendMessage(id, {
                react: {
                    text: action === 'promote' ? '👑' : '💔',
                    key:  { remoteJid: id, id: 'reaction-' + Date.now() }
                }
            })
        }

    } catch (e) {
        console.log('[PROMOTE/DEMOTE] خطأ:', e.message)
    }
}
