import axios from 'axios'

// Multiple public mirrors are tried in order — these services go up and down
// constantly, so a single hard-coded endpoint breaks quickly.
const AUDIO_APIS = [
    u => `https://api.nexoracle.com/downloader/ytmp3?apikey=free&url=${u}`,
    u => `https://api.zenkey.my.id/dl/ytmp3?url=${u}`,
    u => `https://api.nyxs.pw/dl/ytmp3?url=${u}`,
    u => `https://api.maher-zubair.tech/download/ytmp3?url=${u}`,
    u => `https://api.giftedtech.my.id/api/download/dlmp3?apikey=gifted&url=${u}`,
]

const VIDEO_APIS = [
    u => `https://api.nexoracle.com/downloader/ytmp4?apikey=free&url=${u}`,
    u => `https://api.zenkey.my.id/dl/ytmp4?url=${u}`,
    u => `https://api.nyxs.pw/dl/ytmp4?url=${u}`,
    u => `https://api.maher-zubair.tech/download/ytmp4?url=${u}`,
    u => `https://api.giftedtech.my.id/api/download/dlmp4?apikey=gifted&url=${u}`,
]

const pickUrl = obj => {
    if (!obj || typeof obj !== 'object') return null
    const candidates = [
        obj.url, obj.download_url, obj.download, obj.link, obj.audio, obj.video,
        obj.result?.url, obj.result?.download_url, obj.result?.download,
        obj.result?.audio, obj.result?.video, obj.data?.url, obj.data?.download_url,
        obj.data?.download, obj.data?.audio, obj.data?.video,
    ]
    for (const c of candidates) {
        if (typeof c === 'string' && c.startsWith('http')) return c
    }
    return null
}

const pickTitle = obj =>
    obj?.title || obj?.result?.title || obj?.data?.title ||
    obj?.result?.info?.title || obj?.info?.title || null

const tryApis = async (apis, url) => {
    const errors = []
    for (const build of apis) {
        try {
            const { data } = await axios.get(build(encodeURIComponent(url)), { timeout: 25000 })
            const link = pickUrl(data)
            if (link) return { url: link, title: pickTitle(data) }
            errors.push('رد بدون رابط')
        } catch (e) {
            errors.push(e?.message || 'فشل الطلب')
        }
    }
    throw new Error('كل السيرفرات وقعت: ' + errors.slice(0, 2).join(' | '))
}

export const getYtAudio = url => tryApis(AUDIO_APIS, url)
export const getYtVideo = url => tryApis(VIDEO_APIS, url)
