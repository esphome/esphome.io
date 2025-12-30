# **UART Distance Sensor**

The distance\_uart sensor platform allows you to use a wide variety of UART-based ultrasonic distance sensors with ESPHome. Ideally, this component replaces the need for specific drivers for every model variation (A01, A02, A06, etc.) by unifying them into a single, configurable driver.

Many of these sensors are originally manufactured by [Shenzhen DYP Sensor Technology Co., Ltd](https://www.dypcn.com/ultrasonic-distance-sensor/) and are widely rebranded by vendors like DFRobot, Adafruit, and others. If you have a UART ultrasonic sensor that looks like one of these but isn't listed by name, it is likely a rebadged DYP sensor compatible with this component.

This component supports:

- **Automatic Modes:** Sensors that output data constantly.  
- **Controlled Modes:** Sensors that require a trigger signal (via a pin or UART TX).  
- **Processed vs Realtime:** Switching output modes on supported hardware (**Automatic modes only**).

## **Supported Models**

The following models have pre-defined configurations. You can specify the model parameter to automatically set the Blind Zone, Max Range, and Operating Mode.

| Model Name | Blind Zone | Max Range | Baud Rate | Mode | Sensor RX Pin Usage |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **A01 Series** |  |  |  |  |  |
| A01A | 28cm | 750cm | 9600 | Configurable | Trigger / Mode Select |
| A01ANYTB | 28cm | 750cm | 9600 | **Controlled** | Trigger Input |
| A01ANYUB | 28cm | 750cm | 9600 | **Auto** | Selects Processed/Realtime |
| A01B | 28cm | 750cm | 9600 | Configurable | Trigger / Mode Select |
| A01BNYTB | 28cm | 750cm | 9600 | **Controlled** | Trigger Input |
| A01BNYUB | 28cm | 750cm | 9600 | **Auto** | Selects Processed/Realtime |
| A01BNYTW | 28cm | 750cm | 9600 | **Controlled** | Trigger Input |
| A01BNYUW | 28cm | 750cm | 9600 | **Auto** | Selects Processed/Realtime |
| A01C | 28cm | 250cm | 9600 | Configurable | Trigger / Mode Select |
| A01CNYTB | 28cm | 250cm | 9600 | **Controlled** | Trigger Input |
| A01CNYUB | 28cm | 250cm | 9600 | **Auto** | Selects Processed/Realtime |
| **A02 Series** |  |  |  |  |  |
| A02 | 3cm | 450cm | 9600 | Configurable | Trigger / Mode Select |
| A02YYT | 3cm | 450cm | 9600 | **Controlled** | Trigger Input |
| A02YYTW | 3cm | 450cm | 9600 | **Controlled** | Trigger Input |
| A02YYU | 3cm | 450cm | 9600 | **Auto** | Selects Processed/Realtime |
| A02YYUW | 3cm | 450cm | 9600 | **Auto** | Selects Processed/Realtime |
| **A06 Series** |  |  |  |  |  |
| A06 | 25cm | 600cm | 9600 | Configurable | Trigger / Mode Select |
| A06B | 30cm | 200cm | 9600 | Configurable | Trigger / Mode Select |
| A06BNYT | 30cm | 200cm | 9600 | **Controlled** | Trigger Input |
| A06BNYU | 30cm | 200cm | 9600 | **Auto** | Selects Processed/Realtime |
| A06LYT | 25cm | 600cm | 9600 | **Controlled** | Trigger Input |
| A06LYU | 25cm | 600cm | 9600 | **Auto** | Selects Processed/Realtime |
| A06NYT | 25cm | 600cm | 9600 | **Controlled** | Trigger Input |
| A06NYU | 25cm | 600cm | 9600 | **Auto** | Selects Processed/Realtime |
| **A07 Series** |  |  |  |  |  |
| A07 | 25cm | 800cm | 9600 | Configurable | Trigger (if Controlled) |
| A07NYTB | 25cm | 800cm | 9600 | **Controlled** | Trigger Input |
| A07NYUB | 25cm | 800cm | 9600 | **Auto** | \- |
| **A08 Series** |  |  |  |  |  |
| A08A | 25cm | 800cm | 9600 | Configurable | Trigger / Mode Select |
| A08ANYTB | 25cm | 800cm | 9600 | **Controlled** | Trigger Input |
| A08ANYUB | 25cm | 800cm | 9600 | **Auto** | Selects Processed/Realtime |
| A08B | 25cm | 500cm | 9600 | Configurable | Trigger / Mode Select |
| A08BNYTB | 25cm | 500cm | 9600 | **Controlled** | Trigger Input |
| A08BNYUB | 25cm | 500cm | 9600 | **Auto** | Selects Processed/Realtime |
| A08C | 25cm | 200cm | 9600 | **Auto** | Selects Processed/Realtime |
| A08CNYUB | 25cm | 200cm | 9600 | **Auto** | Selects Processed/Realtime |
| **A09 Series** |  |  |  |  |  |
| A09A | 20cm | 350cm | 9600 | Configurable | Trigger / Mode Select |
| A09ANYTW | 20cm | 350cm | 9600 | **Controlled** | Trigger Input |
| A09ANYUW | 20cm | 350cm | 9600 | **Auto** | Selects Processed/Realtime |
| A09B | 28cm | 350cm | 9600 | Configurable | Trigger / Mode Select |
| A09BNYTW | 28cm | 350cm | 9600 | **Controlled** | Trigger Input |
| A09BNYUW | 28cm | 350cm | 9600 | **Auto** | Selects Processed/Realtime |
| **A10 Series** |  |  |  |  |  |
| A10A | 25cm | 450cm | 9600 | Configurable | Trigger / Mode Select |
| A10ANYTW | 25cm | 450cm | 9600 | **Controlled** | Trigger Input |
| A10ANYUW | 25cm | 450cm | 9600 | **Auto** | Selects Processed/Realtime |
| A10B | 28cm | 450cm | 9600 | Configurable | Trigger / Mode Select |
| A10BNYTW | 28cm | 450cm | 9600 | **Controlled** | Trigger Input |
| A10BNYUW | 28cm | 450cm | 9600 | **Auto** | Selects Processed/Realtime |
| **A11 Series** |  |  |  |  |  |
| A11A | 21cm | 300cm | 9600 | Configurable | Trigger / Mode Select |
| A11ANYTW | 21cm | 300cm | 9600 | **Controlled** | Trigger Input |
| A11ANYUW | 21cm | 300cm | 9600 | **Auto** | Selects Processed/Realtime |
| A11B | 23cm | 200cm | 9600 | Configurable | Trigger / Mode Select |
| A11BNYTW | 23cm | 200cm | 9600 | **Controlled** | Trigger Input |
| A11BNYUB | 23cm | 200cm | 9600 | **Auto** | Selects Processed/Realtime |
| **A12 Series** |  |  |  |  |  |
| A12A | 25cm | 500cm | 9600 | Configurable | Trigger / Mode Select |
| A12ANYTW | 25cm | 500cm | 9600 | **Controlled** | Trigger Input |
| A12ANYUW | 25cm | 500cm | 9600 | **Auto** | Selects Processed/Realtime |
| A12B | 25cm | 500cm | 9600 | Configurable | Trigger / Mode Select |
| A12BNYTW | 25cm | 500cm | 9600 | **Controlled** | Trigger Input |
| A12BNYUW | 25cm | 500cm | 9600 | **Auto** | Selects Processed/Realtime |
| **A13 Series** |  |  |  |  |  |
| A13 | 25cm | 200cm | 9600 | Configurable | Trigger / Mode Select |
| A13BNYTW | 25cm | 200cm | 9600 | **Controlled** | Trigger Input |
| A13BNYUW | 25cm | 200cm | 9600 | **Auto** | Selects Processed/Realtime |
| A13NYTW | 25cm | 200cm | 9600 | **Controlled** | Trigger Input |
| A13NYUW | 25cm | 200cm | 9600 | **Auto** | Selects Processed/Realtime |
| **A15 Series** |  |  |  |  |  |
| A15 | 25cm | 200cm | 9600 | Configurable | Trigger (if Controlled) |
| A15NYTW | 25cm | 200cm | 9600 | **Controlled** | Trigger Input |
| A15NYUW | 25cm | 200cm | 9600 | **Auto** | \- |
| **A16 Series** |  |  |  |  |  |
| A16 | 50cm | 1500cm | 9600 | Configurable | Trigger / Mode Select |
| A16NYTW | 50cm | 1500cm | 9600 | **Controlled** | Trigger Input |
| A16NYUW | 50cm | 1500cm | 9600 | **Auto** | Selects Processed/Realtime |
| **A17 Series** |  |  |  |  |  |
| A17 | 25cm | 1000cm | 9600 | Configurable | Trigger (if Controlled) |
| A17NYTW | 25cm | 1000cm | 9600 | **Controlled** | Trigger Input |
| A17NYUW | 25cm | 1000cm | 9600 | **Auto** | \- |
| **A19 Series** |  |  |  |  |  |
| A19 | 28cm | 450cm | 9600 | Configurable | Trigger / Mode Select |
| A19NYTW | 28cm | 450cm | 9600 | **Controlled** | Trigger Input |
| A19NYUW | 28cm | 450cm | 9600 | **Auto** | Selects Processed/Realtime |
| **A20 Series** |  |  |  |  |  |
| A20 | 3cm | 300cm | 9600 | Configurable | Trigger / Mode Select |
| A20NYTW | 3cm | 300cm | 9600 | **Controlled** | Trigger Input |
| A20NYUW | 3cm | 300cm | 9600 | **Auto** | Selects Processed/Realtime |
| **A21 Series** |  |  |  |  |  |
| A21 | 3cm | 500cm | **115200** | Configurable | Trigger / Mode Select |
| A21NYTW | 3cm | 500cm | **115200** | **Controlled** | Trigger Input |
| A21NYUW | 3cm | 500cm | **115200** | **Auto** | Selects Processed/Realtime |
| **A22 Series** |  |  |  |  |  |
| A22 | 2cm | 300cm | **115200** | Configurable | Trigger / Mode Select |
| A22NYTW | 2cm | 300cm | **115200** | **Controlled** | Trigger Input |
| A22NYUW | 2cm | 300cm | **115200** | **Auto** | Selects Processed/Realtime |
| **A25 Series** |  |  |  |  |  |
| A25 | 3cm | 200cm | **115200** | Configurable | Trigger / Mode Select |
| A25YYTW | 3cm | 200cm | **115200** | **Controlled** | Trigger Input |
| A25YYUW | 3cm | 200cm | **115200** | **Auto** | Selects Processed/Realtime |
| **DS1603 Series** |  |  |  |  |  |
| DS1603DA-3U | 4cm | 200cm | 9600 | **Auto** | \- |
| DS1603L | 5cm | 200cm | 9600 | **Auto** | \- |
| **L02 Series** |  |  |  |  |  |
| L02 | 2cm | 200cm | 9600 | Configurable | Trigger (if Controlled) |
| L023MTW | 2cm | 200cm | 9600 | **Controlled** | Trigger Input |
| L023MUW | 2cm | 200cm | 9600 | **Auto** | \- |
| **L07 Series** |  |  |  |  |  |
| L07A | 1.5cm | 200cm | 9600 | Configurable | Trigger (if Controlled) |
| L07AYYTW | 1.5cm | 200cm | 9600 | **Controlled** | Trigger Input |
| L07AYYUW | 1.5cm | 200cm | 9600 | **Auto** | \- |
| **L08 Series** |  |  |  |  |  |
| L08 | 5cm | 300cm | **115200** | **Controlled** | Trigger Input |
| L081MTW | 5cm | 300cm | **115200** | **Controlled** | Trigger Input |
| L08B | 8cm | 300cm | **115200** | **Controlled** | Trigger Input |
| L08B50TW | 8cm | 300cm | **115200** | **Controlled** | Trigger Input |
| **ME007YS Series** |  |  |  |  |  |
| ME007YS | 28cm | 450cm | 9600 | Configurable | Trigger / Mode Select |
| ME007YS-TX | 28cm | 450cm | 9600 | **Auto** | Selects Processed/Realtime |
| ME007YS-TX1 | 28cm | 450cm | 9600 | **Controlled** | Trigger Input |
| **R01 Series** |  |  |  |  |  |
| R01 | 2cm | 400cm | **115200** | Configurable | Trigger / Mode Select |
| R01TW | 2cm | 400cm | **115200** | **Controlled** | Trigger Input |
| R01UW | 2cm | 400cm | **115200** | **Auto** | Selects Processed/Realtime |

## **Configuration variables**

- **uart\_id** (**Optional**, [ID](https://www.google.com/search?q=https://esphome.io/guides/configuration-types.html%23config-id)): The ID of the [UART Component](https://esphome.io/components/uart.html) to use. Required if more than one UART component exists; implied if only one exists.  
- **model** (**Optional**, string): The specific model of your sensor (e.g., A02YYUW, A19, ME007YS). Setting this automatically configures the blind\_zone, max\_range, baud\_rate, and default operating mode.  
- **mode** (**Optional**, string): Manually set the operating mode. Defaults to AUTO if model is not specified.  
  - AUTO: The sensor sends data automatically or upon external polling.  
  - CONTROLLED: ESPHome must trigger the sensor to read data.  
- **update\_interval** (**Optional**, [Time](https://www.google.com/search?q=https://esphome.io/guides/configuration-types.html%23config-time)): The interval to check the sensor. Defaults to 1s.  
  - In CONTROLLED mode: How often to trigger a reading.  
  - In AUTO mode with publish\_mode: INTERVAL: How often to publish the latest state.  
  - In AUTO mode with publish\_mode: IMMEDIATE: This is ignored for publishing (data is pushed as it arrives).  
- **blind\_zone** (**Optional**, [distance](https://www.google.com/search?q=https://esphome.io/guides/configuration-types.html%23config-distance)): Readings below this distance are ignored. Automatically set if model is provided.  
- **max\_range** (**Optional**, [distance](https://www.google.com/search?q=https://esphome.io/guides/configuration-types.html%23config-distance)): Readings above this distance are ignored. Automatically set if model is provided.  
- **trigger\_pin** (**Optional**, [Pin](https://www.google.com/search?q=https://esphome.io/guides/configuration-types.html%23config-pin)): The GPIO pin used to trigger a reading in CONTROLLED mode. If omitted in CONTROLLED mode, the component will attempt to trigger via the UART TX pin (common for A02YYT).  
- **output\_mode** (**Optional**, string): For supported 'Auto' sensors, determines the data processing algorithm.  
  - PROCESSED: (Default) The sensor filters data for stability.  
  - REALTIME: The sensor outputs raw, faster updates (less stable).  
- **output\_mode\_pin** (**Optional**, [Pin](https://www.google.com/search?q=https://esphome.io/guides/configuration-types.html%23config-pin)): The GPIO pin connected to the sensor's mode selection pin (RX pin on the sensor usually) to switch between Processed/Realtime.  
- **publish\_mode** (**Optional**, string): **Only applies when mode is AUTO.**  
  - INTERVAL: (Default) The sensor is polled according to update\_interval, and the last valid reading is published. Recommended for Home Assistant to prevent flooding.  
  - IMMEDIATE: Every valid reading received from the UART is immediately published.
- All other options from [Sensor](/components/sensor).

## **Migrating from Deprecated Components**

The a01nyub and a02yyuw components are now deprecated. Migrating is straightforward: change the platform to distance\_uart and specify the model.

### **Migrating from A01NYUB**

```yaml
# OLD  
sensor:  
  - platform: a01nyub  
    uart_id: uart_bus  
    name: "My Sensor"

# NEW  
sensor:  
  - platform: distance_uart  
    model: A01ANYUB   # Specify the model  
    uart_id: uart_bus # Optional if only one UART  
    name: "My Sensor"
```

### **Migrating from A02YYUW**

```yaml
# OLD  
sensor:  
  - platform: a02yyuw  
    uart_id: uart_bus  
    name: "My Sensor"

# NEW  
sensor:  
  - platform: distance_uart  
    model: A02YYUW    # Specify the model  
    uart_id: uart_bus # Optional if only one UART  
    name: "My Sensor"
```

## **Examples**

### **Simple Auto Sensor (e.g., A02YYUW)**

```yaml
uart:  
  tx_pin: GPIO1  
  rx_pin: GPIO3  
  baud_rate: 9600

sensor:  
  - platform: distance_uart  
    model: A02YYUW  
    name: "Water Level"  
    update_interval: 60s
```

### **Controlled Sensor (e.g., A02YYT)**

The A02YYT requires a trigger signal. By connecting the sensor's RX pin to the ESP's TX pin, this component can trigger the read over UART.

```yaml
uart:  
  tx_pin: GPIO1  
  rx_pin: GPIO3  
  baud_rate: 9600

sensor:  
  - platform: distance_uart  
    model: A02YYT  
    name: "Oil Tank Level"  
    update_interval: 10s
```

### **Sump Pit Level (Advanced Calculation)**

In this example, we calculate the depth of water in a sump pit. The sensor returns the "air gap" (distance from sensor to water), so we subtract that from the total depth of the pit to get the water level.

```yaml
sensor:  
  - platform: distance_uart  
    name: "Sump Pit Water Depth"  
    model: A13NYTW  
    update_interval: 5s  
    unit_of_measurement: "in"  
    icon: "mdi:waves"  
    accuracy_decimals: 2  
    filters:  
      # Filter noise by taking the median of the last 6 readings  
      - median:  
          window_size: 6  
          send_every: 6  
          send_first_at: 6  
      # Convert "Distance to Water" (Air Gap) into "Depth of Water"  
      - lambda: |-  
          // x is the sensor reading in meters (e.g., 0.5m)  
          // 1. Convert meters to inches  
          float air_gap_inches = x * 39.3701;  
            
          // 2. Define physical constants  
          float total_pit_depth = 72.0;  
          float sensor_offset = 3.0; // Mounting height or enclosure offset  
            
          // 3. Calculate water depth: (Total Depth - Offset) - Air Gap  
          return (total_pit_depth - sensor_offset) - air_gap_inches;
```

### **Custom "Generic" Sensor**

If your model is not in the list, you can manually define the parameters.

```yaml
sensor:  
  - platform: distance_uart  
    name: "Unknown Sensor"  
    mode: CONTROLLED  
    trigger_pin: GPIO5  
    blind_zone: 5cm  
    max_range: 4.5m  
    update_interval: 5s
```

## **See Also**

- [Sensor Filters](/components/sensor#sensor-filters)
- [UART Bus](/components/uart)
- {{< apiref "distance_uart/distance_uart.h" "distance_uart/distance_uart.h" >}}
