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

### Most Important Parameters

| Field | Required | Description                              | Default Value |
| ------| :------: | ---------------------------------------- | :-----------: |
| **platform** | *Yes* | Must always be set to `HomebridgeSomneo`.| N/A |
| **name** | *Yes* | Set the plugin name for display in the Homebridge logs | `Homebridge Somneo` |
| **host** | *Yes* | IP address or hostname of the Somneo clock. | N/A |

### Optional Parameters

| Field | Required | Description                              | Default Value |
| ------| :-------: | ---------------------------------------- | :------------: |
| **pollingSeconds**| No | Time in seconds for how often to ping the clock. | `30` or 30000 milliseconds |
| **enableHumitidySensor**| No | Boolean value for whether or not to include the Humidity Sensor. | `true` |
| **enableLuxSensor**| No | Boolean value for whether or not to include the Light (or Lux) Sensor. | `true` |
| **enableTemperatureSensor** | No | Boolean value for whether or not to include the Temperature Sensor. | `true` |
| **enableMainLights** | No | Boolean value for whether or not to include the Main Light (The dimmable light). | `true` |
| **enableNightLight** | No | Boolean value for whether or not to include the Night Light. |`true`|
| **enableRelaxBreatheProgram** | No | Boolean value for whether or not to include the RelaxBreathe Program switch. | `true` |
| **enableSunsetProgram** | No | Boolean value for whether or not to include the Sunset Program switch. | `true` |
| **enableAudio** | No | Boolean value for whether or not to include the Audio receiver to use the FM Radio and/or Auxiliary Input. | `true` |
| **favoriteInput** | No | Numeric value specifying the input for the Somneo Audio to go to the first time its turned on in a session. After changing the input, the Somneo will go to the last used input. | `1` or FM Preset 1 |

##### Configuration Parameters Notes

Due to the way that the Config UI X visual editor works, in order to not force users to write to their config file when they want to use accessory but have not selected anything, the boolean values can either be a literal boolean of `true` or a string boolean of `"true"`.

###### Input Enumeration
1. FM Preset 1 is `1`
2. FM Preset 2 is `2`
3. FM Preset 3 is `3`
4. FM Preset 4 is `4`
5. FM Preset 5 is `5`
6. Auxiliary is `6`

##### Somneo Audio Accessory Note

The Somneo clock has 5 FM radio presets and an auxiliary input. To help accomodate this, an audio receiver called `Somneo Audio` is available. You can turn in on and it will default to `FM Preset 1`. Additionally, you can raise and lower the volume with the Remote widget in iOS/iPadOS's Control Center.

However, due the way that audio receivers are implemented in Homebridge, they must be exposed as an *External Plugin*. This means that the `Somneo Audio` will need to be onboarded separately from the other accessories.

###### Onboarding Instructions for Somneo Audio

1. Select `Add Accessory` in the Home app.
2. Then select `I Don't Have a Code or Cannot Scan`.
3. Then the `Somneo Audio` receiver should show as an option. It should look like:
<img src="https://user-images.githubusercontent.com/5261774/112217388-f5632d80-8bf8-11eb-83e1-2ce41e83fd20.jpg" width="320" />
4. Enter your Homebridge PIN and the device will connect to your home.

#### Config Example

```json
{
  "platforms": [
    {
      "name": "Homebridge Somneo",
      "host": "10.0.0.24",
      "platform": "HomebridgeSomneo"
    }
  ]
}
```

## Future Plans
- Currently the plugin only supports one Somneo clock. Not sure how many people have multiple clocks.
- No support for sound sensor. HomeKit does not have a sound level sensor. I thought about having an occupancy sensor, but would need to know what sound level occupied/not should be considered.
- Better error handling. I am a Java developer by trade and am still learning Typescript :).

## Recognition
Thanks to:

* [homebridge](https://github.com/homebridge/homebridge-plugin-template) - For creating a great template to get started with.
* [fototeddy](https://github.com/fototeddy/homebridge-somneo-sensors) - For creating a Homebridge Somneo plugin that reads the sensors.
* [DeKnep](https://www.domoticz.com/forum/viewtopic.php?t=33033) - For creating a similar plugin in another platform and exposing endpoints for control.
