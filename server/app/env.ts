import 'dotenv/config'

const AISSTREAM_API_KEY = process.env.AISSTREAM_API_KEY
const PORT = Number(process.env.PORT ?? 3001)

if (!AISSTREAM_API_KEY) {
    throw new Error('Missing AISSTREAM_API_KEY in .env')
}

export const env = {
    AISSTREAM_API_KEY,
    PORT,
}
