# NodeJs interface for smartcielo remote AC control API (MRCOOL)

by Nicholas Robinson

Smartcielo (MRCOOL) plug-in for [Homebridge](https://github.com/nfarina/homebridge) using the smartcielo API.

Integrate your MRCOOL AC into your HomeKit system.

[![mit license](https://badgen.net/badge/license/MIT/red)](https://github.com/nicholasrobinson/homebridge-smartcielo/blob/master/LICENSE)
[![npm](https://badgen.net/npm/v/homebridge-smartcielo)](https://www.npmjs.com/package/homebridge-smartcielo)
[![npm](https://badgen.net/npm/dt/homebridge-smartcielo)](https://www.npmjs.com/package/homebridge-smartcielo)

Forked from:
https://github.com/X1ZOR/homebridge-dummy-thermostat

With inspiration from:
https://github.com/chrisjshull/homebridge-nest

# Installation

<!-- 2. Clone (or pull) this repository from github into the same path Homebridge lives (usually `/usr/local/lib/node_modules`). Note: the code currently on GitHub is in beta, and is newer than the latest published version of this package on `npm` -->
1. Install homebridge using: `npm install -g homebridge`
2. Install this plug-in using: `npm install -g homebridge-smartcielo`
3. Update your configuration file. See example `config.json` snippet below.

# Configuration

Configuration sample (edit `~/.homebridge/config.json`):

```json
"accessories": [
     {
       "accessory": "SmartCielo",
       "name": "SmartCielo",
       "username": "<SMARTCIELO_USERNAME>",
       "password": "<SMARTCIELO_PASSWORD>",
       "ip": "<PUBLIC_IP_ADDRESS>",
     }
]
```

## Structure

| Key | Description |
| --- | --- |
| `accessory` | Must be `SmartCielo` |
| `name` | Name to appear in the Home app |
| `username` | smartcielo.com username |
| `password` | smartcielo.com password |
| `ip` | public ip address where ac resides |
| `temperatureDisplayUnits` _(optional)_ | Whether you want °C (`0`) or °F (`1`) as your units (`1` is default) |
| `model` _(optional)_ | Appears under "Model" for your accessory in the Home app |
| `manufacturer` _(optional)_ | Appears under "Manufacturer" for your accessory in the Home app |

# Things to try with Siri

* Hey Siri, *set the temperature to 72 degrees*. (in heat-only or cool-only mode)
* Hey Siri, *set the temperature range to between 65 and 70 degrees*. (in auto mode, for systems that can heat and cool)
* Hey Siri, *set the thermostat to cool*. (try heat, cool, auto, or off)
* Hey Siri, *turn on the air conditioning*.
* Hey Siri, *what's the temperature at home*?
* Hey Siri, *what's the temperature in the Basement*? (get the temperature from a Nest Temperature Sensor)

Please let me know if you find this useful or come up with any novel implementations.

Enjoy!

Nicholas Robinson

me@nicholassavilerobinson.com
