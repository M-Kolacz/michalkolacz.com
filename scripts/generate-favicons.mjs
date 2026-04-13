import { readFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const svg = await readFile('app/assets/favicons/favicon.svg')

async function writePng(size, out) {
	await sharp(svg).resize(size, size).png().toFile(out)
}

await writePng(180, 'app/assets/favicons/apple-touch-icon.png')
await writePng(192, 'public/favicons/android-chrome-192x192.png')
await writePng(512, 'public/favicons/android-chrome-512x512.png')

const icoSizes = [16, 32, 48]
const icoPngs = await Promise.all(
	icoSizes.map((s) => sharp(svg).resize(s, s).png().toBuffer()),
)

const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(icoSizes.length, 4)

const entries = []
let offset = 6 + 16 * icoSizes.length
for (let i = 0; i < icoSizes.length; i++) {
	const entry = Buffer.alloc(16)
	entry.writeUInt8(icoSizes[i], 0)
	entry.writeUInt8(icoSizes[i], 1)
	entry.writeUInt8(0, 2)
	entry.writeUInt8(0, 3)
	entry.writeUInt16LE(1, 4)
	entry.writeUInt16LE(32, 6)
	entry.writeUInt32LE(icoPngs[i].length, 8)
	entry.writeUInt32LE(offset, 12)
	entries.push(entry)
	offset += icoPngs[i].length
}

const ico = Buffer.concat([header, ...entries, ...icoPngs])
await writeFile('public/favicon.ico', ico)

console.log('Favicons regenerated from app/assets/favicons/favicon.svg')
