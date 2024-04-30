# Accuweather Scraper

AccuWeather APIs free tier allows 50 calls per day. What about bumping that number to 100k ?

After sraping weather.com in this repo: [weather.com-scraper](https://github.com/victrme/weather.com-scraper), I realised that AccuWeather has all the information we need on the default page, and getting the location is fairly easy.

Test it here: https://accuweather.victr.me/

#### Note

This api may be subject to change. Do not use `https://*.victr.*` urls in production !

## Queries

| Query | Type       | Description                                     |
| ----- | ---------- | ----------------------------------------------- |
| lat   | Float      | Latitude coordinates                            |
| lon   | Float      | Longitude coordinates                           |
| unit  | "c" or "f" | Use celsius or football fields. Defaults to "C" |
| lang  | string     | A 2 character language code. Defaults to "en"   |

## Returns

A single JSON object from all the information available on the "weather-forecast" page.

[Live example](https://accuweather.victr.me/)

```js
const example = {
	now: {
		icon: 7,
		temp: 16,
		feels: 15,
		description: 'Nublado',
	},
	sun: {
		duration: '14 h 17 min',
		rise: 1714451460000,
		set: 1714502880000,
	},
	hourly: [
		{
			timestamp: 1714485600000,
			temp: 14,
			rain: '65 %',
		},
	],
	daily: [
		{
			timestamp: 1714485600000,
			high: 16,
			low: 8,
			day: 'Chubascos en la tarde',
			night: 'Algo de lluvia más tarde',
			rain: '100 %',
		},
	],
}
```

## Typescript

Here is an example on how you can use this in a Typescript codebase:

```ts
let json: AccuWeather.Data

try {
	const response = await fetch('your-endpoint.worker.dev')
	json = await response.json()
} catch (e) {
	console.log('Witness my error handling skills')
}
```

```ts
namespace AccuWeather {
	export interface Data {
		today?: Today
		now: Now
		sun: Sun
		hourly: Hourly[]
		daily: Daily[]
	}

	export type Today = {
		day: string
		night: string
		high: number
		low: number
	}

	export type Now = {
		icon: number
		temp: number
		feels: number
		description: string
	}

	export type Sun = {
		duration: string
		rise: number
		set: number
	}

	export type Hourly = {
		timestamp: number
		temp: number
		rain: string
	}

	export type Daily = {
		timestamp: number
		high: number
		low: number
		day: string
		night: string
		rain: string
	}
}
```

## Deploy your own

_Same as weather.com-scraper_

Using Cloudflare Workers, you can get 100k request per day without even adding a payment option. Deploying this worker is very simple:

-   Install Node on your system: https://nodejs.org/en/download
-   Create an account on Cloudflare in https://dash.cloudflare.com
-   Download this repo as a .zip by clicking the green button
-   Extract these files and open a terminal in this folder
-   Run this command `npm install --global wrangler@latest`
-   And deploy with `wrangler deploy`

```bash
npm install --global wrangler@latest

# ... npm stuff
#
# changed 73 packages in 9s

wrangler deploy

# Attempting to login via OAuth...
#
# Total Upload: 12.99 KiB / gzip: 3.58 KiB
# Uploaded accuweather-scraper (3.41 sec)
# Published accuweather-scraper (1.31 sec)
#   https://accuweather-scraper.your-account.workers.dev
```

## Legal

This piece of software is not in agreement with [AccuWeather's Term of Use](https://www.accuweather.com/en/legal):

> 5. **Permitted Uses**. You may download, view, copy and print Products incorporated in or accessed through this Site subject to the following: (1) the Products may be used solely for personal, informational, internal purposes and may not be re-distributed without the express written permission of AccuWeather

I will be happy to nuke this code if someone from AccuWeather legal team decides to send scrary letters or emails. Disclamer, I do not reside in a lawsuit-friendly country.
