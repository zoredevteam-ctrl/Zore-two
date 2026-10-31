const toNum = v => (v + '').replace(/[^0-9]/g, '')

const cleanJid = jid => {
    if (!jid) return null
    const num = toNum(jid.split('@')[0].split(':')[0])
    return num ? num : null
}

const normalizeJid = jid => {
    const num = cleanJid(jid)
    return num ? num + '@s.whatsapp.net' : null
}

const isLidJid = (jid, num) => {
    return jid?.endsWith('@lid') || (num && num.length > 13)
}

const getGroupMetadata = async (conn, jid) => {
    return await conn.groupMetadata(jid)
}

export const resolveWho = async (m, conn, args = []) => {
    let who = null

    if (m.mentionedJid?.length) {
        who = m.mentionedJid[0]
    } else if (m.quoted?.sender) {
        who = m.quoted.sender
    } else if (args[0]) {
        const num = toNum(args[0])
        if (num) who = num + '@s.whatsapp.net'
    }

    if (!who) return null

    const rawNum = cleanJid(who)
    if (!rawNum) return null

    // Always try to resolve the real JID from group metadata. Newer WhatsApp
    // sends @lid in mentions/quotes, and groupParticipantsUpdate rejects @lid,
    // so we must map it back to the participant's phone JID when possible.
    if (m.isGroup) {
        try {
            const meta = await getGroupMetadata(conn, m.chat)
            const found = meta.participants.find(p => {
                const id  = cleanJid(p.id || p.jid)
                const jid = cleanJid(p.jid)
                return id === rawNum || jid === rawNum
            })

            if (found) {
                const real = cleanJid(found.jid || found.id)
                if (real) return real + '@s.whatsapp.net'
            }
        } catch {}
    }

    return normalizeJid(who)
}