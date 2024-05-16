import scraper from './index.js'

const types = {
	lat: 'string',
	lon: 'string',
	city: 'string',
	region: 'string',
	path: 'string',
	now: {
		icon: 'number',
		temp: 'number',
		feels: 'number',
		description: 'string',
	},
	sun: {
		duration: 'string',
		rise: 'number',
		set: 'number',
	},
	hourly: [
		{
			timestamp: 'number',
			temp: 'number',
			rain: 'string',
		},
	],
	daily: [
		{
			timestamp: 'number',
			high: 'number',
			low: 'number',
			day: 'string',
			night: 'string',
			rain: 'string',
		},
	],
}

async function test() {
	const url = 'https://example.com?lang=fr&lat=48.8582&lon=2.2944'
	const resp = await scraper.fetch(new Request(url))
	const json = await resp.json()

	compareTypes(json, types)
}

function compareTypes(obj, types) {
	for (const [key, type] of Object.entries(types)) {
		if (typeof type === 'object') {
			compareTypes(obj[key], type)
			continue
		}

		if (typeof obj[key] !== type) {
			throw `${key} should be of type ${type}, but got ${typeof obj[key]}`
		}
	}
}

await test()
