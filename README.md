# homebridge-somneo

## What This Plugin Is
This is a plugin for [homebridge](https://github.com/homebridge/homebridge). It allows for management of the [Philips Somneo HF3670/60](https://www.usa.philips.com/c-p/HF3670_60/smartsleep-connected-sleep-and-wake-up-light). Additionally, it provides sensor data from the clock.

## How the Plugin Works
The Somneo Clock has a small HTTP server running inside with a limited API. Through Googling and trial-and-error, I've found commands that work to replicate the SleepMapper app.

This server is very low powered though and if you see error messages in your logs it's most likely that two connections were trying to be processed at once.

### Conflicting Accessories

In the physical world, the Somneo clock is a single device. But in the HomeBridge world, it is multiple. For this reason, I've created the concept of *Conflicting Accessories*.

A *Conflicting Accessory* means an accessory that needs full control over a physical device. In the case of the Somneo clock, there are two physical devices:

1. The LED light.
2. The audio speaker.

If a program requires light, it will turn off all other devices that require light. If it requires audio it will turn off all that require audio.

Below, is a chart explaining what will be turned off (if on) when an accessory is turned on.

| | Main Light | Night Light | Sunset Program | RelaxBreathe Program | Audio |
| --- | :---: | :----------: | :------------: | :------------------: | :---: |
| Main Light<br />Turns On | N/A | **Turns Off** | **Turns Off** | **Turns Off** | Unaffected |
| Night Light<br />Turns On| **Turns Off** | N/A | **Turns Off** | **Turns Off** | Unaffected |
| Sunset <br />Turns On | **Turns Off** | **Turns Off** | N/A | **Turns Off** | **Turns Off**
| RelaxBreathe<br />Turns On | **Turns Off** | **Turns Off** | **Turns Off** | N/A | **Turns Off**|
| Audio<br/>Turns On | Unaffected | Unaffected | **Turns Off** | **Turns Off** | N/A

## Installation

Before installing this plugin, you should install Homebridge using the [official instructions](https://github.com/homebridge/homebridge/wiki).

### Install via Homebridge Config UI X

1. Search for `Homebridge Somneo` on the Plugins tab of [Config UI X](https://www.npmjs.com/package/homebridge-config-ui-x).
2. Install the `Homebridge Somneo` plugin and use the form to enter your configuration.

### Manual Installation

1. Install this plugin using: `sudo npm install -g homebridge-somneo --unsafe-perm`.
2. Edit `config.json` manually to add your information. See below for instructions on that.

## Manual Configuration

### Platform Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :--------: | ----------------------------- | :----------: |
| **platform** | *Yes* | string | Must always be set to `HomebridgeSomneo`.| N/A |
| **name** | *Yes* | string | Set the platform name for display in the Homebridge logs. | `Homebridge Somneo` |
| **somneos** | *Yes* | object[] | An array of configurations for Somneo clocks | N/A |
| **pollingSeconds**| No | number | Time in seconds for how often to ping the clock. | `30` (30000 milliseconds) |

#### Somneo Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **name** | *Yes* | string | The name of the clock. It will be used as a prefix for all of the accessories it exposes. | N/A |
| **host** | *Yes* | string | IP address or hostname of the Somneo clock. | N/A |
| **sensors** | *Yes* | object | Settings for sensors in the Somneo clock. | N/A |
| **lights** | *Yes* | object | Settings for lights in the Somneo clock. | N/A |
| **switches** | *Yes* | object | Settings for switches in the Somneo clock. | N/A |
| **audio** | *Yes* | object | Settings for the audio device in the Somneo clock. | N/A |

##### Sensors Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **humidity** | *Yes* | object | Settings for the humidity sensor. | N/A |
| **lux** | *Yes* | object | Settings for the lux (light) sensor. | N/A |
| **temperature** | *Yes* | object | Settings for the temperature sensor. | N/A |

###### Humidity Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **isEnabled** | No | boolean | Determines whether or not to expose the humidity sensor. | `true` |

###### Lux Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **isEnabled** | No | boolean | Determines whether or not to expose the lux (light) sensor. | `true` |

###### Temperature Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **isEnabled** | No | boolean | Determines whether or not to expose the temperature sensor. | `true` |

##### Lights Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **mainLight** | *Yes* | object | Settings for the main (dimmable) light. | N/A |
| **nightLight** | *Yes* | object | Settings for the (on/off) night light. | N/A |

###### MainLight Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **isEnabled** | No | boolean | Determines whether or not to expose the main light. | `true` |

###### NightLight Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **isEnabled** | No | boolean | Determines whether or not to expose the night light. | `true` |

##### Switches Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **relaxBreathe** | *Yes* | object | Settings for the RelaxBreathe Program switch. | N/A |
| **sunset** | *Yes* | object | Settings for the Sunset Program switch. | N/A |

###### RelaxBreathe Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **isEnabled** | No | boolean | Determines whether or not to expose the RelaxBreathe Program switch. | `true` |
| **breathsPerMin**| No| number | How many breaths you want to take per minute. | `4` (BPM converted to the Philips value 1) |
| **duration** | No | number | How long the RelaxBreathe Program should run for. | `10` (minutes) |
| **guidanceType** | No | number | What kind of guided RelaxBreathe program to run.<br /><br />Possible values:<ul><li>Light = `0`</li><li>Sound = `1`</li></ul> | `0` (Light) |
| **lightIntensity** | No | number | How bright the RelaxBreathe Program be at its peak. The value is a percentage that will be converted to a number between `1 and 25`. | `80` (80% converted to the the Philips API value 20) |
| **volume** | No | number | How loud the RelaxBreathe Program should be at its peak. The value is a percentage that will be converted to a number between `1 and 25`. | `48` (48% converted to the the Philips API value 12) |

###### Sunset Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **isEnabled** | No | boolean | Determines whether or not to expose the Sunset Program switch. | `true` |
| **duration** | No | number | How long the Sunset Program should run for. | `30` (minutes) |
| **lightIntensity** | No | number | How bright the Sunset Program be at the start. The value is a percentage that will be converted to a number between `1 and 25`. | `80` (80% converted to the the Philips API value 20) |
| **colorScheme** | No | string | What color pattern should play during the Sunset Program.<br /><br />Possible values:<ul><li>Sunny Day = `'0'`</li><li>Island Red = `'1'`</li><li>Nordic White = `'2'`</li><li>Carribean Red = `'3'`</li></ul> | `'0'` (Sunny Day) |
| **ambientSounds** | No | string | What sounds should play during the Sunset Program.<br /><br />Possible values:<ul><li>Soft Rain = `'1'`</li><li>Ocean Waves = `'2'`</li><li>Under Water = `'3'`</li><li>Summer Lake = `'4'`</li><li>No Sound = `'0'`</li></ul> | `'1'` (Soft Rain) |
| **volume** | No | number | How loud the Sunset Program should be at the start. The value is a percentage that will be converted to a number between `1 and 25`. | `48` (48% converted to the the Philips API value 12) |

##### Audio Schema

| Field | Required | Data Type | Description                   | Default Value |
| ------| :------: | :-------: | ----------------------------- | :-----------: |
| **isEnabled** | No | boolean |  Determines whether or not to expose the Audio Device.  | `true` |
| **favoriteInput** | No | number | Numeric value specifying the input for the Somneo Audio to go to the first time its turned on in a session.<br /><br />After changing the input, the Somneo will go to the last used input.<br /><br />Possible values:<ul><li>FM Preset 1 = `1`</li><li>FM Preset 2 = `2`</li><li>FM Preset 3 = `3`</li><li>FM Preset 4 = `4`</li><li>FM Preset 5 = `5`</li><li>Auxiliary = `6`</li></ul> | `1` (FM Preset 1) |

### Somneo Audio Device Note

The Somneo clock has 5 FM radio presets and an auxiliary input. To help accomodate this, an audio receiver called `Somneo Audio` is available. You can turn in on and it will default to `FM Preset 1`. Additionally, you can raise and lower the volume with the Remote widget in iOS/iPadOS's Control Center.

However, due the way that audio receivers are implemented in Homebridge, they must be exposed as an *External Plugin*. This means that the `Somneo Audio` will need to be onboarded separately from the other accessories.

#### Onboarding Instructions for Somneo Audio

1. Select `Add Accessory` in the Home app.
2. Then select `I Don't Have a Code or Cannot Scan`.
3. Then the `Somneo Audio` receiver should show as an option. It should look like:
<img src="https://user-images.githubusercontent.com/5261774/112217388-f5632d80-8bf8-11eb-83e1-2ce41e83fd20.jpg" width="320" />
4. Enter your Homebridge PIN and the device will connect to your home.

### Config Examples

#### Simplest Configuration

This configuration will expose all items and use the default polling interval with the least work.

```json
{
  "name": "Homebridge Somneo",
  "somneos": [
    {
      "name": "Master Bedroom Somneo",
      "host": "[INSERT_IP_ADDRESS_HERE]"
    }
  ],
  "platform": "HomebridgeSomneo"
}
```

#### Most Verbose Configuration

This configuration will expose all items with default values, but is very verbose. It is presented here to help visualize the JSON structure.

```json
{
  "name": "Homebridge Somneo",
  "somneos": [
    {
      "name": "Test Somneo",
      "host": "[INSERT_IP_ADDRESS_HERE]",
      "sensors": {
        "humidity": {
          "isEnabled": true
        },
        "lux": {
          "isEnabled": true
        },
        "temperature": {
          "isEnabled": true
        }
      },
      "lights": {
        "mainLight": {
          "isEnabled": true
        },
        "nightLight": {
          "isEnabled": true
        }
      },
      "switches": {
        "relaxBreathe": {
          "isEnabled": true,
          "breathsPerMin": 4,
          "duration": 10,
          "guidanceType": 0,
          "lightIntensity": 80,
          "volume": 48
        },
        "sunset": {
          "isEnabled": true,
          "duration": 30,
          "lightIntensity": 80,
          "colorScheme": 0,
          "ambientSounds": "1",
          "volume": 48
        }
      },
      "audio": {
        "isEnabled": true,
        "favoriteInput": 1
      }
    }
  ],
  "pollingSeconds": 30,
  "platform": "HomebridgeSomneo"
}
```

## Future Plans
- No support for sound sensor. HomeKit does not have a sound level sensor. I thought about having an motion sensor, but would need to know what sound level motion detected/not should be considered.
- Better error handling. I am a Java developer by trade and am still learning Typescript :).

## Recognition
Thanks to:

* [homebridge](https://github.com/homebridge/homebridge-plugin-template) - For creating a great template to get started with.
* [fototeddy](https://github.com/fototeddy/homebridge-somneo-sensors) - For creating a Homebridge Somneo plugin that reads the sensors.
* [DeKnep](https://www.domoticz.com/forum/viewtopic.php?t=33033) - For creating a similar plugin in another platform and exposing endpoints for control.
