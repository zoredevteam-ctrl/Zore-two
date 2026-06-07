// ─── EVENTO: Promote / Demote ─────────────────────────────────────────────────
// Carpeta: events/group-promote-demote.js

export const event = 'group-participants.update'

const getThumb = async () => {
    try {
        const src = global.icon || global.avatar || global.banner
        if (!src) return null
        const res = await fetch(src)
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
        title:                 global.botName,
        body:                  global.botText,
        mediaType:             1,
        thumbnail:             thumb,
        renderLargerThumbnail: false,
        sourceUrl:             global.rcanal
    }
})

// ── Textos promote ────────────────────────────────────────────────────────────

const PROMOTE_MSGS = (name, group) => [

`*ꕥ👑* ¡El reino de *${group}* tiene un nuevo guardián!

> ✰ @${name} ha sido coronado/a como *Administrador/a* de este lugar~
> ꕥ Que uses bien tu poder, darling... o yo misma te lo quito 💗`,

`*ꕥ🌸* Las estrellas han hablado en *${group}*~

> ✰ @${name} ahora forma parte de los elegidos.
> ꕥ *Administrador/a* desde este momento. No me decepciones 💗`,

`*ꕥ✨* Un nuevo título ha sido otorgado en *${group}*

> ✰ @${name} — bienvenido/a al rango de *Admin.*
> ꕥ El reino confía en ti... hmph, yo también supongo 💗`,

`*ꕥ💎* ¡Atención ciudadanos de *${group}*!

> ✰ @${name} ha ascendido a *Administrador/a.*
> ꕥ Cuida bien este lugar o tendrás que responderme a mí~ 💗`,

]

// ── Textos demote ─────────────────────────────────────────────────────────────

const DEMOTE_MSGS = (name, group) => [

`*ꕥ😔* El reino de *${group}* ha hablado...

> ✰ @${name} ha sido destituido/a como *Administrador/a.*
> ꕥ Así son las cosas darling, el poder no es para siempre 💔`,

`*ꕥ😞* Tiempos difíciles en *${group}*~

> ✰ @${name} ya no ostenta el título de *Admin.*
> ꕥ Espero que hayas aprendido algo de esta experiencia... 💔`,

`*ꕥ💔* El trono ha cambiado en *${group}*

> ✰ @${name} fue removido/a del cargo de *Administrador/a.*
> ꕥ Sin rencores, darling. Así funciona este reino~ 💔`,

`*ꕥ😤* Las decisiones del reino de *${group}* son definitivas.

> ✰ @${name} perdió su rango de *Admin.*
> ꕥ Qué le vamos a hacer... yo tampoco puedo hacer nada 💔`,

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
                text:     texto,
                mentions: mention,
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
        console.log('[PROMOTE/DEMOTE] Error:', e.message)
    }
}
