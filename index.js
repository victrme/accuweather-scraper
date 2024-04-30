import { decode } from 'html-entities'
import striptags from 'striptags'

export default { fetch: main }

async function main(request) {
	const url = new URL(request.url)
	const unit = url.searchParams.get('unit') ?? 'C'
	const lang = url.searchParams.get('lang') ?? 'en'
	const lat = url.searchParams.get('lat') ?? request.cf.latitude
	const lon = url.searchParams.get('lon') ?? request.cf.longitude

	let start = performance.now()
	const html = await getWeatherHTML(lat, lon, lang, unit)
	console.log(performance.now() - start)

	start = performance.now()
	const json = parseContent(html)
	console.log(performance.now() - start)

	const headers = {
		'access-control-allow-methods': 'GET',
		'access-control-allow-origin': '*',
		'content-type': 'application/json',
		'cache-control': 'public, max-age=1800',
	}

	return new Response(JSON.stringify(json), { headers })
}

// Parse

/**
 * @param {string} html
 * @returns {Object}
 */
function parseContent(html) {
	let date = new Date()
	let result = {}

	html = html.replaceAll('°', '')

	let today = htmlContentToStringArray(
		html,
		html.indexOf('today-forecast-card'),
		html.indexOf('cur-con-weather-card')
	)

	result.today = {
		day: today[3].trimStart(),
		night: today[5].slice(today[5].indexOf(': ') + 2),
		high: parseInt(today[4].slice(4)),
		low: parseInt(today[6].slice(4)),
	}

	let current = htmlContentToStringArray(
		html,
		html.indexOf('cur-con-weather-card'),
		html.indexOf('local-forecast-summary')
	)

	result.now = {
		temp: parseInt(current[3]),
		feels: parseInt(current[6].slice(9)),
		description: current[5],
	}

	let sun = htmlContentToStringArray(
		html,
		html.indexOf('sunrise-sunset__body'),
		html.indexOf('air-quality-module__title')
	)

	let [rh, rm] = sun[3].split(':')
	let [sh, sm] = sun[5].split(':')

	if (rm.includes('PM')) rh += 12
	if (sm.includes('PM')) sh += 12

	rm = parseInt(rm.replace(' AM', '').replace(' PM', ''))
	sm = parseInt(sm.replace(' AM', '').replace(' PM', ''))

	date = new Date()
	const sunrise = new Date(date.getFullYear(), date.getMonth(), date.getDate(), rh, rm)
	const sunset = new Date(date.getFullYear(), date.getMonth(), date.getDate(), sh, sm)

	result.sun = {
		duration: sun[1],
		rise: sunrise.getTime(),
		set: sunset.getTime(),
	}

	let hourly = htmlContentToStringArray(
		html,
		html.indexOf('hourly-list__list-wrapper'),
		html.indexOf('daily-list')
	)

	hourly.shift()
	hourly.pop()
	result.hourly = []

	date = new Date()
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)

	for (let i = 0; i < hourly.length; i += 3) {
		result.hourly.push({
			timestamp: date.getTime(),
			temp: parseInt(hourly[i + 1]),
			rain: hourly[i + 2],
		})

		date.setHours(date.getHours() + 1)
	}

	let daily = htmlContentToStringArray(
		html,
		html.indexOf('daily-list'),
		html.indexOf('sunrise-sunset')
	)

	result.daily = []

	date = new Date()
	date.setMinutes(0)
	date.setSeconds(0)
	date.setMilliseconds(0)

	for (let i = 2; i < daily.length; i += 7) {
		result.daily.push({
			timestamp: date.getTime(),
			high: parseInt(daily[i + 2]),
			low: parseInt(daily[i + 3]),
			day: daily[i + 4],
			night: daily[i + 5],
			rain: daily[i + 6],
		})

		date.setDate(date.getDate() + 1)
	}

	return result
}

/**
 * Slice relevent content, strip html tags, split strings.
 * Returns all non-empty tags in an array
 * @param {string} html
 * @param {number} start
 * @param {number} end
 * @returns {string[]}
 */
function htmlContentToStringArray(html, start, end) {
	html = html.slice(start, end)
	html = striptags(html, undefined, '\n')
	html = html.split('\n').filter((v) => v)
	return html
}

// Requests

/**
 * Return accuweather.com HTML page with all the necessery information
 *
 * @param {number} lat - Latitude coordinates
 * @param {number} lon - Longitude coordinates
 * @param {string} lang - Content language, "en" by default
 * @param {"C" | "F"} unit - Either celsius or football fields
 * @returns {Promise<string>}
 */
async function getWeatherHTML(lat, lon, lang, unit) {
	const path = `https://www.accuweather.com/${lang}/search-locations?query=${lat},${lon}`
	const firefoxAndroid = 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/124.0 Firefox/124.0'

	// TODO
	lang = 'en'

	const resp = await fetch(path, {
		headers: {
			Accept: 'text/html',
			'Accept-Encoding': 'gzip',
			'Accept-Language': 'en',
			'User-Agent': firefoxAndroid,
			Cookie: `awx_user=tp:${unit}|lang:${lang};`,
		},
	})

	let text = await resp.text()

	text = text.slice(text.indexOf('id="interstitial'), text.indexOf('id="bottom'))
	text = text.replaceAll('\n', '').replaceAll('\t', '')
	text = decode(text)

	return text
}
