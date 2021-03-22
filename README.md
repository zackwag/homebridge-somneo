# homebridge-somneo

## What This Plugin Is
This is a plugin for [homebridge](https://github.com/homebridge/homebridge). It allows for management of the [Philips Somneo HF3670/60](https://www.usa.philips.com/c-p/HF3670_60/smartsleep-connected-sleep-and-wake-up-light). Additionally, it provides sensor data from the clock.

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
| **enableSunsetProgram** | No | Boolean value for whether or not to include the Sunset Program switch. | `true` |

##### Configuration Parameters Note
Due to the way that the Config UI X visual editor works, in order to not force users to write to their config file when they actually want to use an accessory, the boolean values can either be a literal boolean of `true` or a string boolean of `"true"`.


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
- Support for more accessories. I would love to add a switch to turn on the FM radio or AUX, but can't find that. Any help would be appreciated.
- No support for sound sensor. HomeKit does not have a sound level sensor. I thought about having an occupancy sensor, but would need to know what sound level occupied/not should be considered.
- Better error handling. I am a Java developer by trade and am still learning Typescript :).

## Recogition
Thanks to:

* [homebridge](https://github.com/homebridge/homebridge-plugin-template) - For creating a great template to get started with.
* [fototeddy](https://github.com/fototeddy/homebridge-somneo-sensors) - For creating a Homebridge Somneo plugin that reads the sensors.
* [DeKnep](https://www.domoticz.com/forum/viewtopic.php?t=33033) - For creating a similar plugin in another platform and exposing endpoints for control.
