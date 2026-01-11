# DS1603L_esphome
DS1603L V1.0 Ultrasonic Sensor with Level and Volume over UART without modification.

## **MINIMUM CONFIGURATION**
```
uart:
  - id: ds1603l_1
    tx_pin: GPIOXX
    rx_pin: GPIOXX
    baud_rate: 9600  
    
sensor: 
  - platform: DS1603L 
    uart_id: ds1603l_1                
    liquid_level:                     
      name: "DS1603L 1 Distance"
```
## Configuration variables

- **liquid_level** (**Required**): Sensor output in mm.
- **liquid_volume** (*Optional*): Output volume calculated from min/max.
- **update_interval** (*Optional*): Set interval in seconds. Defaults to `60s`
- **min_level** (*Optional*, int): Define minimum level in mm. Defaults to `0`.
- **max_level** (*Optional*, int): Define maximum level in mm. Defaults to `1000`.
- **min_volume** (*Optional*, int): Define minimum volume. Defaults to `0`.
- **max_volume** (*Optional*, int): Define maximum volume. Defaults to `1000`.
  
These variables are for both level and volume
- **name** (**Required**, string): Name your sensor.
- **unit_of_measurement** (*Optional*, string): Level outputs mm. Volume should match min/max volume unit of measurement to calculate properly.
- **accuracy_decimals** (*Optional*): Set decimals output. Defaults to `0`
- **sensor options** (*Optional*): All other options from sensor including filters.
>[!NOTE]
>These sensors read from the bottom of a tank and need to have some kind of couplant for them to work. There can be no air gap between sensor and bottom of container. I use clear silicone grease, easily found at most automotive or hardware stores.

![ds1603l](https://github.com/user-attachments/assets/79b79543-64df-4499-a3a5-8f55cbde69c7)

[ds1603-v1_0-datasheet.pdf](https://github.com/user-attachments/files/24546581/ds1603-v1_0-datasheet.pdf)



### **EXAMPLE**

```yaml
esphome:
  name: esp-name

esp32:
  board: esp32dev
  framework:
    type: esp-idf

logger:

api:
  encryption:
    key: !secret api_encryption_key

ota:
  - platform: esphome
    password: !secret ota_password

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password
 

  ap:
    ssid: Esp Fallback Hotspot
    password: !secret ap_password

captive_portal:

uart:   #required for sensor
  - id: ds1603l_1
    tx_pin: GPIOXX
    rx_pin: GPIOXX
    baud_rate: 9600 
    
  - id: ds1603l_2
    tx_pin: GPIO1    
    rx_pin: GPIO3 
    baud_rate: 9600 
    
sensor: 

################
### Sensor 1 ###
################
  - platform: DS1603L 
    uart_id: ds1603l_1                   # must match uart config
    min_level: 0.0                       # set minimum level in mm  *default 0.0
    max_level: 600.0                     # set maximum level in mm  *default 1000.0
    min_volume: 0.0                      # set minimum volume in whatever unit_of_measurement you prefer  *default 0.0
    max_volume: 55.0                     # set maximum volume in same unit as min_volume  *default 1000.0
    liquid_level:                        # get level in mm
      state_class: measurement           # for HA
      device_class: distance             # for HA
      name: "DS1603L 1 Distance"         # name for HA
      unit_of_measurement: "mm"          # sensor outputs mm, can be set to anything but will need filtering to convert
      icon: mdi:arrow-expand-vertical    # icon for HA
      filters:                           # some filters I found useful
        - filter_out: 0
        - filter_out: nan
        - delta: 1.0
    liquid_volume:
      name: "DS1603L 1 Volume"
      unit_of_measurement: "gal"
      filters:
        - filter_out: 0
        - filter_out: nan
        - delta: 1.0
################
### Sensor 2 ###
################
  - platform: DS1603L
    uart_id: ds1603l_2
    min_level: 0.0
    max_level: 600.0
    min_volume: 0.0
    max_volume: 55.0
    liquid_level:
      name: "DS1603L 2 Distance"
      state_class: measurement 
      device_class: distance 
      unit_of_measurement: "mm"
      icon: mdi:arrow-expand-vertical 
    liquid_volume:
      name: "DS1603L 2 Volume"
      unit_of_measurement: "gal"
  
```
