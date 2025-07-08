.. title:: ESPHome

.. meta::
    :google-site-verification: Q5q5TFbCofxA8-cSa1Frv5Hj4RopF5zwEZf_zaNHqf4

.. seo::
    :description: ESPHome Homepage - Reimagining DIY Home Automation. ESPHome is a framework that
      tries to provide the best possible use experience for using IoT microcontrollers
      for Home Automation. Just write a simple YAML configuration file and get your own customized firmware.
    :image: logo.svg

.. image:: /images/logo-text.svg
    :class: dark-invert

ESPHome is a system to control your microcontrollers by simple yet powerful configuration files and control them remotely through Home Automation systems.

.. image:: /images/hero.png

.. raw:: html

    <div class="guide-container">
        <div class="guide-card">
            <h3 class="guide-card-title">Getting started</h3>
            <ul>
                <li>
                    <a class="reference" href="/guides/getting_started_hassio.html">
                        from Home Assistant
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/getting_started_command_line.html">
                        using the command line
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/migrate_sonoff_tasmota.html">
                        by migrating from Tasmota
                    </a>
                </li>
            </ul>
            <div class="example highlight">
                <pre>
                    <span class="nt">esphome</span><span class="p">:</span>
                    <span class="w">&nbsp;&nbsp;</span><span class="nt">name</span><span class="p">:</span><span class="w"> </span><span class="l l-Scalar l-Scalar-Plain">awesome</span>
                    <span class="nt">esp32</span><span class="p">:</span>
                    <span class="w">&nbsp;&nbsp;</span><span class="nt">board</span><span class="p">:</span><span class="w"> </span><span class="l l-Scalar l-Scalar-Plain">nodemcu-32s</span>
                </pre>
            </div>
        </div>
        <div class="guide-card">
            <h3 class="guide-card-title">Next steps</h3>
            <ul>
                <li>
                    <a class="reference" href="/guides/faq.html">
                        FAQ and Tips
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/automations.html">
                        Automations
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/diy.html">
                        DIY Examples
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/configuration-types.html">
                        Configuration types
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/creators.html">
                        Sharing ESPHome devices
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/made_for_esphome.html">
                        Made for ESPHome program
                    </a>
                </li>
            </ul>
        </div>
        <div class="guide-card">
            <h3 class="guide-card-title">Keeping up</h3>
            <ul>
                <li>
                    <a class="reference" href="https://discord.gg/KhAMKrd" target="_blank">
                        Discord
                    </a>
                </li>
                <li>
                    <a class="reference" href="https://community.home-assistant.io/c/esphome/" target="_blank">
                        Forums
                    </a>
                </li>
                <li>
                    <a class="reference" href="/changelog/index.html">
                        Changelog
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/supporters.html">
                        Supporters
                    </a>
                </li>
                <li>
                    <a class="reference" href="/guides/contributing.html">
                        Contributing
                    </a>
                </li>
            </ul>
        </div>
    </div>

.. _devices:

Platforms
---------

.. imgtable::

    ESP8266, components/esp8266, esp8266.svg
    ESP32, components/esp32, esp32.svg
    RP2040, components/rp2040, rp2040.svg
    BK72xx, components/libretiny, bk72xx.svg
    RTL87xx, components/libretiny, rtl87xx.svg

Core Components
---------------

.. imgtable::

    Core, components/esphome, cloud-circle.svg, dark-invert
    WiFi, components/wifi, network-wifi.svg, dark-invert
    MQTT, components/mqtt, mqtt.png
    Network, components/network, network-wifi.svg, dark-invert

    I²C Bus, components/i2c, i2c.svg
    SPI Bus, components/spi, spi.svg
    UART Bus, components/uart, uart.svg
    CAN Bus, components/canbus, canbus.svg

    OTA Updates, components/ota, system-update.svg, dark-invert
    Logger, components/logger, file-document-box.svg, dark-invert
    Web Server, components/web_server, http.svg, dark-invert

    Native API, components/api, server-network.svg, dark-invert
    Power Supply, components/power_supply, power.svg, dark-invert
    Deep Sleep, components/deep_sleep, hotel.svg, dark-invert
    External Components, components/external_components, external_components.svg, dark-invert

Sensor Components
-----------------

Sensors are split into categories. If a sensor fits into more than one category, it will be listed multiple times.

Core
****
.. imgtable::

    Sensor Core, components/sensor/index, folder-open.svg, dark-invert
    Home Assistant, components/sensor/homeassistant, home-assistant.svg, dark-invert
    MQTT Subscribe, components/sensor/mqtt_subscribe, mqtt.png
    Uptime Sensor, components/sensor/uptime, timer.svg, dark-invert
    WiFi Signal Strength, components/sensor/wifi_signal, network-wifi.svg, dark-invert
    Template Sensor, components/sensor/template, description.svg, dark-invert
    Custom Sensor, components/sensor/custom, language-cpp.svg, dark-invert


Air Quality
***********
.. imgtable::

    AirThings BLE, components/sensor/airthings_ble, airthings_logo.png, Radon, CO2, Volatile organics
    CCS811, components/sensor/ccs811, ccs811.jpg, CO2 & Volatile organics
    EE895, components/sensor/ee895, EE895.png,  CO2 & Temperature & Pressure
    GCJA5, components/sensor/gcja5, gcja5.svg, Particulate
    HM3301, components/sensor/hm3301, hm3301.jpg, Particulate
    MH-Z19, components/sensor/mhz19, mhz19.jpg, CO2 & Temperature
    MiCS-4514, components/sensor/mics_4514, mics_4514.jpg, Gas concentration
    PM1006 Sensor, components/sensor/pm1006, pm1006.jpg, Particulate
    PMSA003I, components/sensor/pmsa003i, pmsa003i.jpg, Particulate
    PMSX003, components/sensor/pmsx003, pmsx003.svg, Particulate
    RadonEye BLE, components/sensor/radon_eye_ble, radon_eye_logo.png, Radon
    SDS011 Sensor, components/sensor/sds011, sds011.jpg, Particulate
    SEN0321, components/sensor/sen0321, sen0321.jpg, Ozone
    SEN5x, components/sensor/sen5x, sen54.jpg, Temperature & Humidity, Volatile organics and NOx
    SenseAir, components/sensor/senseair, senseair_s8.jpg, CO2
    SCD30, components/sensor/scd30, scd30.jpg, CO2 & Temperature & Humidity
    SCD4X, components/sensor/scd4x, scd4x.jpg, CO2 & Temperature & Humidity
    SGP30, components/sensor/sgp30, sgp30.jpg, CO2 & Volatile organics
    SGP4x, components/sensor/sgp4x, sgp40.jpg, Volatile organics and NOx
    SM300D2, components/sensor/sm300d2, sm300d2.jpg, Air quality
    SPS30, components/sensor/sps30, sps30.jpg, Particulate
    T6613/15, components/sensor/t6615, t6615.jpg, CO2
    ZyAura, components/sensor/zyaura, zgm053.jpg, CO2 & Temperature & Humidity


Analogue
********
.. imgtable::

    ADC, components/sensor/adc, flash.svg, ESP internal, dark-invert
    ADC128S102, components/sensor/adc128s102, adc128s102.png , 8-channel ADC
    ADS1115, components/sensor/ads1115, ads1115.jpg, 4-channel ADC
    CD74HC4067, components/sensor/cd74hc4067, cd74hc4067.jpg, 16-channel analog multiplexer
    MCP3008, components/sensor/mcp3008, mcp3008.jpg, 8-channel ADC
    MCP3204 / MCP3208, components/sensor/mcp3204, mcp3204.jpg, 4-channel ADC
    Resistance, components/sensor/resistance, omega.svg, dark-invert


Bluetooth Low Energy (BLE)
**************************
.. imgtable::

    AM43, components/sensor/am43, am43.jpg, Lux & Battery level
    BLE Client Sensor, components/sensor/ble_client, bluetooth.svg, dark-invert
    BLE RSSI, components/sensor/ble_rssi, bluetooth.svg, dark-invert
    Inkbird IBS-TH1 Mini, components/sensor/inkbird_ibsth1_mini, inkbird_isbth1_mini.jpg, Temperature & Humidity
    Mopeka Pro Check LP, components/sensor/mopeka_pro_check, mopeka_pro_check.jpg, tank level
    Mopeka Standard Check LP, components/sensor/mopeka_std_check, mopeka_std_check.jpg, tank level
    RuuviTag, components/sensor/ruuvitag, ruuvitag.jpg, Temperature & Humidity & Accelerometer
    Xiaomi BLE, components/sensor/xiaomi_ble, xiaomi_mijia_logo.jpg, Various
    Alpha3, components/sensor/alpha3, alpha3.jpg


Digital Signals
***************
.. imgtable::

    Duty Cycle, components/sensor/duty_cycle, percent.svg, dark-invert
    Pulse Counter, components/sensor/pulse_counter, pulse.svg, dark-invert
    Pulse Meter, components/sensor/pulse_meter, pulse.svg, dark-invert
    Pulse Width, components/sensor/pulse_width, pulse.svg, dark-invert


Distance
********
.. imgtable::

    A01NYUB, components/sensor/a01nyub, a01nyub.jpg, Acoustic distance
    HRXL MaxSonar WR, components/sensor/hrxl_maxsonar_wr, hrxl_maxsonar_wr.jpg, Acoustic distance
    TOF10120, components/sensor/tof10120, tof10120.jpg, IR optical distance
    Ultrasonic Sensor, components/sensor/ultrasonic, ultrasonic.jpg, Acoustic distance
    VL53L0x, components/sensor/vl53l0x, vl53l0x.jpg, IR optical distance
    Zio Ultrasonic Sensor, components/sensor/zio_ultrasonic, zio_ultrasonic.jpg, Acoustic distance


Electricity
***********
.. imgtable::

    ADE7953, components/sensor/ade7953, ade7953.svg, Power
    ATM90E26, components/sensor/atm90e26, atm90e26.jpg, Voltage & Current & Power
    ATM90E32, components/sensor/atm90e32, atm90e32.jpg, Voltage & Current & Power
    BL0939, components/sensor/bl0939, bl0939.png, Voltage & Current & Power & Energy
    BL0940, components/sensor/bl0940, bl0940.png, Voltage & Current & Power
    BL0942, components/sensor/bl0942, bl0942.png, Voltage & Current & Power
    CS5460A, components/sensor/cs5460a, cs5460a.png, Voltage & Current & Power
    CSE7761, components/sensor/cse7761, cse7761.svg, Voltage & Current & Power
    CSE7766, components/sensor/cse7766, cse7766.svg, Voltage & Current & Power
    CT Clamp, components/sensor/ct_clamp, ct_clamp.jpg, AC current
    Daly BMS, components/sensor/daly_bms, daly_bms.jpg, Voltage & Current & Power
    DSMR, components/sensor/dsmr, dsmr.svg, Electrical counter
    HLW8012, components/sensor/hlw8012, hlw8012.svg, Voltage & Current & Power
    INA219, components/sensor/ina219, ina219.jpg, DC Current
    INA226, components/sensor/ina226, ina226.jpg, DC Current & Power
    INA260, components/sensor/ina260, ina260.jpg, DC Current & Power
    INA3221, components/sensor/ina3221, ina3221.jpg, 3-Ch DC current
    MAX9611, components/sensor/max9611, max9611.jpg, +60VDC Voltage & Current & Power & Temperature
    PZEM AC, components/sensor/pzemac, pzem-ac.jpg, Voltage & Current & Power
    PZEM DC, components/sensor/pzemdc, pzem-dc.jpg, Voltage & Current & Power
    PZEM004T, components/sensor/pzem004t, pzem004t.svg, Voltage & Current & Power
    SDM Meter, components/sensor/sdm_meter, sdm220m.jpg, Modbus energy monitor
    Selec Meter, components/sensor/selec_meter, selec_meter_em2m.jpg, Modbus energy monitor
    Teleinfo, components/sensor/teleinfo, teleinfo.jpg, Electrical counter
    Total Daily Energy, components/sensor/total_daily_energy, sigma.svg, dark-invert


Environmental
*************

.. imgtable::

    Absolute Humidity, components/sensor/absolute_humidity, water-drop.svg, dark-invert
    AHT10 / AHT20 / AHT21 / DHT20, components/sensor/aht10, aht10.jpg, Temperature & Humidity
    AirThings BLE, components/sensor/airthings_ble, airthings_logo.png, Temperature & Humidity & Pressure
    AM2320, components/sensor/am2320, am2320.jpg, Temperature & Humidity
    BME280, components/sensor/bme280, bme280.jpg, Temperature & Humidity & Pressure
    BME680, components/sensor/bme680, bme680.jpg, Temperature & Humidity & Pressure & Gas
    BME680 via BSEC, components/sensor/bme680_bsec, bme680.jpg, Temperature & Humidity & Pressure & Gas
    BMP085, components/sensor/bmp085, bmp180.jpg, Temperature & Pressure
    BMP280, components/sensor/bmp280, bmp280.jpg, Temperature & Pressure
    BMP388 and BMP390, components/sensor/bmp3xx, bmp388.jpg, Temperature & Pressure
    BMP581, components/sensor/bmp581, bmp581.jpg, Temperature & Pressure
    b-parasite, components/sensor/b_parasite, b_parasite.jpg, Moisture & Temperature & Humidity & Light
    Dallas DS18B20, components/sensor/dallas, dallas.jpg, Temperature
    DHT, components/sensor/dht, dht.jpg, Temperature & Humidity
    DHT12, components/sensor/dht12, dht12.jpg, Temperature & Humidity
    DPS310, components/sensor/dps310, dps310.jpg, Temperature & Pressure
    ENS210, components/sensor/ens210, ens210.jpg, Temperature & Humidity
    HDC1080, components/sensor/hdc1080, hdc1080.jpg, Temperature & Humidity
    HTE501, components/sensor/hte501, HTE501.png, Temperature & Humidity
    Honeywell ABP, components/sensor/honeywellabp, honeywellabp.jpg, Pressure & Temperature
    HTU21D / Si7021 / SHT21, components/sensor/htu21d, htu21d.jpg, Temperature & Humidity
    Hydreon Rain Sensor, components/sensor/hydreon_rgxx, hydreon_rg9.jpg, Rain
    Inkbird IBS-TH1 Mini, components/sensor/inkbird_ibsth1_mini, inkbird_isbth1_mini.jpg, Temperature & Humidity
    Internal Temperature, components/sensor/internal_temperature, thermometer.svg, Temperature, dark-invert
    MCP9808, components/sensor/mcp9808, mcp9808.jpg, Temperature
    MH-Z19, components/sensor/mhz19, mhz19.jpg, CO2 & Temperature
    MLX90614, components/sensor/mlx90614, mlx90614.jpg, Temperature
    MPL3115A2, components/sensor/mpl3115a2, mpl3115a2.jpg, Temperature & Pressure
    MS5611, components/sensor/ms5611, ms5611.jpg, Pressure
    NTC Thermistor, components/sensor/ntc, ntc.jpg, Temperature
    PMWCS3, components/sensor/pmwcs3, pmwcs3.jpg, Soil moisture & Temperature
    QMP6988, components/sensor/qmp6988, qmp6988_env3.png, Temperature & Pressure
    RadonEye BLE, components/sensor/radon_eye_ble, radon_eye_logo.png, Radon
    RuuviTag, components/sensor/ruuvitag, ruuvitag.jpg, Temperature & Humidity & Accelerometer
    SCD30, components/sensor/scd30, scd30.jpg, CO2 & Temperature & Humidity
    SCD4X, components/sensor/scd4x, scd4x.jpg, CO2 & Temperature & Humidity
    SDP3x / SDP800 Series, components/sensor/sdp3x, sdp31.jpg, Pressure
    SHT3X-D, components/sensor/sht3xd, sht3xd.jpg, Temperature & Humidity
    SHT4X, components/sensor/sht4x, sht4x.jpg, Temperature & Humidity
    SHTCx, components/sensor/shtcx, shtc3.jpg, Temperature & Humidity
    SMT100, components/sensor/smt100, smt100.jpg, Moisture & Temperature
    STS3X, components/sensor/sts3x, sts3x.jpg, Temperature
    TEE501, components/sensor/tee501, TEE501.png, Temperature
    TMP102, components/sensor/tmp102, tmp102.jpg, Temperature
    TMP117, components/sensor/tmp117, tmp117.jpg, Temperature
    TMP1075, components/sensor/tmp1075, tmp1075.jpg, Temperature
    HYT271, components/sensor/hyt271, hyt271.jpg, Temperature & Humidity


Light
*****
.. imgtable::

    AM43, components/sensor/am43, am43.jpg, Lux
    APDS9960, components/sensor/apds9960, apds9960.jpg, Colour & Gesture
    AS7341, components/sensor/as7341, as7341.jpg, Spectral Color Sensor
    BH1750, components/sensor/bh1750, bh1750.jpg, Lux
    LTR390, components/sensor/ltr390, ltr390.jpg, Lux & UV
    MAX44009, components/sensor/max44009, max44009.svg, Lux
    TCS34725, components/sensor/tcs34725, tcs34725.jpg, Lux & RGB colour
    TSL2561, components/sensor/tsl2561, tsl2561.jpg, Lux
    TSL2591, components/sensor/tsl2591, tsl2591.jpg, Lux


Magnetic
********
.. imgtable::

    ESP32 Hall Sensor, components/sensor/esp32_hall, magnet.svg, ESP internal, dark-invert
    HMC5883L, components/sensor/hmc5883l, hmc5883l.jpg, 3-Axis magnetometer
    MMC5603, components/sensor/mmc5603, mmc5603.jpg, 3-Axis magnetometer
    MLX90393, components/sensor/mlx90393, mlx90393.jpg, 3-Axis magnetometer
    QMC5883L, components/sensor/qmc5883l, qmc5883l.jpg, 3-Axis magnetometer


Miscellaneous
*************
.. imgtable::

    AS3935, components/sensor/as3935, as3935.jpg, Storm lightning
    Binary Sensor Map, components/sensor/binary_sensor_map, binary_sensor_map.jpg, Map binary to value
    b-parasite, components/sensor/b_parasite, b_parasite.jpg, Moisture & Temperature & Humidity & Light
    Duty Time, components/sensor/duty_time, timer-play-outline.svg, dark-invert
    EZO sensor circuits, components/sensor/ezo, ezo-ph-circuit.png, (pH)
    FS3000, components/sensor/fs3000, fs3000.jpg, Air velocity
    Havells Solar, components/sensor/havells_solar, havellsgti5000d_s.jpg, Solar rooftop
    Integration, components/sensor/integration, sigma.svg, dark-invert
    Growatt Solar, components/sensor/growatt_solar, growatt.jpg, Solar rooftop
    Kalman Combinator, components/sensor/kalman_combinator, function.svg, dark-invert
    Modbus Sensor, components/sensor/modbus_controller, modbus.png
    Nextion, components/sensor/nextion, nextion.jpg, Sensors from display
    Rotary Encoder, components/sensor/rotary_encoder, rotary_encoder.jpg
    SMT100, components/sensor/smt100, smt100.jpg, Moisture & Temperature
    Tuya Sensor, components/sensor/tuya, tuya.png
    TX20, components/sensor/tx20, tx20.jpg, Wind speed & Wind direction
    uFire EC sensor, components/sensor/ufire_ec, ufire_ec.png, EC & Temperature
    uFire ISE sensor, components/sensor/ufire_ise, ufire_ise.png, pH & Temperature
    Resol VBus, components/vbus, resol_deltasol_bs_plus.jpg
    Person Sensor (SEN21231), components/sensor/sen21231, sen21231.png
    Kuntze pool sensor, components/sensor/kuntze, kuntze.jpg


Motion
******
.. imgtable::

    APDS9960, components/sensor/apds9960, apds9960.jpg, Colour & Gesture
    MPU6050, components/sensor/mpu6050, mpu6050.jpg, Accelerometer & Gyroscope
    MPU6886, components/sensor/mpu6886, mpu6886.jpg, Accelerometer & Gyroscope
    RuuviTag, components/sensor/ruuvitag, ruuvitag.jpg, Temperature & Humidity & Accelerometer
    LD2410, components/sensor/ld2410, ld2410.jpg, Motion & Presence


Thermocouple
************
.. imgtable::

    KMeterISO, components/sensor/kmeteriso, kmeteriso.jpg, K-Type,
    MAX31855, components/sensor/max31855, max31855.jpg, K-Type
    MAX31856, components/sensor/max31856, max31856.jpg, All types
    MAX31865, components/sensor/max31865, max31865.jpg, Platinum RTD
    MAX6675, components/sensor/max6675, max6675.jpg, K-Type,
    MCP9600, components/sensor/mcp9600, mcp9600.jpg, All types


Weight
******
.. imgtable::

    HX711, components/sensor/hx711, hx711.jpg, Load cell amplifier
    Xiaomi Miscale, components/sensor/xiaomi_miscale, xiaomi_miscale1&2.jpg


Looking for a sensor that outputs its values as an analog voltage? Have a look at the
:doc:`ADC Sensor </components/sensor/adc>` together with a formula like in the `TEMT6000
configuration <https://devices.esphome.io/devices/temt6000>`__.


Binary Sensor Components
------------------------

Binary Sensors are split into categories. If a sensor fits into more than one category, it will be listed multiple times.

Core
****
.. imgtable::

    Binary Sensor Core, components/binary_sensor/index, folder-open.svg, dark-invert
    Custom Binary Sensor, components/binary_sensor/custom, language-cpp.svg, dark-invert
    GPIO, components/binary_sensor/gpio, pin.svg, dark-invert
    Home Assistant, components/binary_sensor/homeassistant, home-assistant.svg, dark-invert
    Status, components/binary_sensor/status, server-network.svg, dark-invert
    Template Binary Sensor, components/binary_sensor/template, description.svg, dark-invert

Capacitive Touch
****************
.. imgtable::

    CAP1188 Capacitive Touch Sensor, components/binary_sensor/cap1188, cap1188.jpg
    ESP32 Touch Pad, components/binary_sensor/esp32_touch, touch.svg, dark-invert
    MPR121  Capacitive Touch Sensor, components/binary_sensor/mpr121, mpr121.jpg
    TTP229, components/binary_sensor/ttp229, ttp229.jpg

Mechanical
**********
.. imgtable::

    Matrix Keypad, components/matrix_keypad, matrix_keypad.jpg
    TM1637, components/display/tm1637, tm1637.jpg
    TM1638, components/display/tm1638, tm1638.jpg

NFC/RFID Components
*******************

Often known as "tag" or "card" readers within the community.

.. imgtable::

    PN532, components/binary_sensor/pn532, pn532.jpg
    RC522, components/binary_sensor/rc522, rc522.jpg
    RDM6300, components/binary_sensor/rdm6300, rdm6300.jpg

Touchscreen
***********
.. imgtable::

    Nextion Binary Sensor, components/binary_sensor/nextion, nextion.jpg
    Touchscreen, components/touchscreen/index, touch.svg, dark-invert
    TT21100, components/touchscreen/tt21100, esp32-s3-korvo-2-lcd.png
    XPT2046, components/binary_sensor/xpt2046, xpt2046.jpg

Miscellaneous
*************
.. imgtable::

    Analog Threshold, components/binary_sensor/analog_threshold, analog_threshold.svg, dark-invert
    ESP32 BLE Presence, components/binary_sensor/ble_presence, bluetooth.svg, dark-invert
    Hydreon Rain Sensor Binary Sensor, components/binary_sensor/hydreon_rgxx, hydreon_rg9.jpg
    LD2410, components/sensor/ld2410, ld2410.jpg
    Modbus Binary Sensor, components/binary_sensor/modbus_controller, modbus.png
    PipSolar - compatible PV Inverter, components/pipsolar, pipsolar.jpg
    Remote Receiver, components/remote_receiver, remote.svg, dark-invert
    Resol VBus, components/vbus, resol_deltasol_bs_plus.jpg
    Tuya Binary Sensor, components/binary_sensor/tuya, tuya.png

Output Components
-----------------

.. imgtable::

    Output Core, components/output/index, folder-open.svg, dark-invert
    ESP8266 Software PWM, components/output/esp8266_pwm, pwm.png
    Slow PWM, components/output/slow_pwm, pwm.png
    GPIO Output, components/output/gpio, pin.svg, dark-invert
    ESP32 DAC, components/output/esp32_dac, dac.svg
    ESP32 LEDC, components/output/ledc, pwm.png
    LibreTiny PWM, components/output/libretiny_pwm, pwm.png
    AC Dimmer, components/output/ac_dimmer, ac_dimmer.svg, dark-invert
    PCA9685, components/output/pca9685, pca9685.jpg
    TLC59208F, components/output/tlc59208f, tlc59208f.jpg
    TLC5947, components/output/tlc5947, tlc5947.jpg
    MY9231/MY9291, components/output/my9231, my9231.svg
    SM16716, components/output/sm16716, sm16716.svg
    SM2135, components/output/sm2135, sm2135.svg
    SM2235, components/output/sm2235, sm2235.svg
    SM2335, components/output/sm2335, sm2335.svg
    MCP4725, components/output/mcp4725, mcp4725.jpg
    MCP4728, components/output/mcp4728, mcp4728.jpg
    MCP47A1, components/output/mcp47a1, mcp47a1.svg
    DAC7678, components/output/dac7678, dac7678.svg
    BLE Binary Output, components/output/ble_client, bluetooth.svg, dark-invert
    Modbus Output, components/output/modbus_controller, modbus.png
    Custom Output, components/output/custom, language-cpp.svg, dark-invert
    Sigma-Delta Output, components/output/sigma_delta_output, sigma-delta.svg, dark-invert
    Template Output, components/output/template, description.svg, dark-invert
    BP1658CJ, components/output/bp1658cj, bp1658cj.svg
    BP5758D, components/output/bp5758d, bp5758d.svg
    X9C Potentiometer, components/output/x9c, x9c.jpg
    GP8403, components/output/gp8403, gp8403.svg

Light Components
----------------

.. imgtable::

    Light Core, components/light/index, folder-open.svg, dark-invert
    Binary Light, components/light/binary, lightbulb.svg, dark-invert
    Status Led, components/light/status_led, led-on.svg, dark-invert
    Monochromatic Light, components/light/monochromatic, brightness-medium.svg, dark-invert

    Cold+Warm White Light, components/light/cwww, brightness-medium.svg, dark-invert
    Color Temperature Light, components/light/color_temperature, brightness-medium.svg, dark-invert
    RGB Light, components/light/rgb, rgb.png
    RGBW Light, components/light/rgbw, rgbw.png
    RGBWW Light, components/light/rgbww, rgbw.png
    RGBCT Light, components/light/rgbct, rgbw.png

    ESP32 RMT, components/light/esp32_rmt_led_strip, color_lens.svg, dark-invert
    RP2040 PIO, components/light/rp2040_pio_led_strip, color_lens.svg, dark-invert
    FastLED Light, components/light/fastled, color_lens.svg, dark-invert
    NeoPixelBus Light, components/light/neopixelbus, color_lens.svg, dark-invert
    Light Partition, components/light/partition, color_lens.svg, dark-invert

    Tuya Dimmer, components/light/tuya, tuya.png
    Shelly Dimmer, components/light/shelly_dimmer, shellydimmer2.jpg
    Custom Light, components/light/custom, language-cpp.svg, dark-invert
    LightWaveRF, components/light/lightwaverf, brightness-medium.svg

    H-bridge Light, components/light/hbridge, brightness-medium.svg, dark-invert
    Sonoff D1 Dimmer, components/light/sonoff_d1, sonoff_d1.jpg

Looking for WS2811 and similar individually addressable lights? Have a look at the
:doc:`FastLED Light </components/light/fastled>`.

Switch Components
-----------------

.. imgtable::

    Switch Core, components/switch/index, folder-open.svg, dark-invert
    GPIO Switch, components/switch/gpio, pin.svg, dark-invert
    Restart Switch, components/switch/restart, restart.svg, dark-invert
    Safe Mode Switch, components/switch/safe_mode, restart-alert.svg, dark-invert
    Shutdown Switch, components/switch/shutdown, power_settings.svg, dark-invert
    Factory Reset Switch, components/switch/factory_reset, restart-alert.svg, dark-invert
    Generic Output Switch, components/switch/output, upload.svg, dark-invert
    Template Switch, components/switch/template, description.svg, dark-invert
    UART Switch, components/switch/uart, uart.svg
    Custom Switch, components/switch/custom, language-cpp.svg, dark-invert
    Tuya Switch, components/switch/tuya, tuya.png
    Modbus Switch, components/switch/modbus_controller, modbus.png
    BLE Client Switch, components/switch/ble_client, bluetooth.svg, dark-invert
    Nextion Switch, components/switch/nextion, nextion.jpg

Button Components
-----------------

.. imgtable::

    Button Core, components/button/index, folder-open.svg, dark-invert
    Template Button, components/button/template, description.svg, dark-invert
    Generic Output Button, components/button/output, upload.svg, dark-invert
    Restart Button, components/button/restart, restart.svg, dark-invert
    Safe Mode Button, components/button/safe_mode, restart-alert.svg, dark-invert
    Shutdown Button, components/button/shutdown, power_settings.svg, dark-invert
    Factory Reset Button, components/button/factory_reset, restart-alert.svg, dark-invert
    Wake-on-LAN, components/button/wake_on_lan, power_settings.svg, dark-invert


Fan Components
--------------

.. imgtable::

    Fan Core, components/fan/index, folder-open.svg, dark-invert
    Binary Fan, components/fan/binary, fan.svg, dark-invert
    H-bridge Fan, components/fan/hbridge, fan.svg, dark-invert
    Speed Fan, components/fan/speed, fan.svg, dark-invert
    Tuya Fan, components/fan/tuya, tuya.png

Display Components
------------------

.. imgtable::

    Display Core, components/display/index, folder-open.svg, dark-invert
    Addressable Light, components/display/addressable_light, addressable_light.jpg
    ILI9xxx, components/display/ili9xxx, ili9341.jpg
    ILI9341, components/display/ili9xxx, ili9341.svg
    ILI9342, components/display/ili9xxx, ili9342.svg
    ILI9481, components/display/ili9xxx, ili9481.svg
    ILI9486, components/display/ili9xxx, ili9341.jpg
    ILI9488, components/display/ili9xxx, ili9488.svg
    Inkplate, components/display/inkplate6, inkplate6.jpg
    LCD Display, components/display/lcd_display, lcd.jpg
    MAX7219, components/display/max7219, max7219.jpg
    MAX7219 Dot Matrix, components/display/max7219digit, max7219digit.jpg
    Nextion, components/display/nextion, nextion.jpg
    PCD8544 (Nokia 5110/ 3310), components/display/pcd8544, pcd8544.jpg
    PVVX MiThermometer, components/display/pvvx_mithermometer, ../components/sensor/images/xiaomi_lywsd03mmc.jpg
    SSD1306, components/display/ssd1306, ssd1306.jpg
    SSD1322, components/display/ssd1322, ssd1322.jpg
    SSD1325, components/display/ssd1325, ssd1325.jpg
    SSD1327, components/display/ssd1327, ssd1327.jpg
    SSD1331, components/display/ssd1331, ssd1331.jpg
    SSD1351, components/display/ssd1351, ssd1351.jpg
    ST7735, components/display/st7735, st7735.jpg
    ST7789V, components/display/st7789v, st7789v.jpg
    ST7796, components/display/ili9xxx, st7796.svg
    ST7920, components/display/st7920, st7920.jpg
    TM1621, components/display/tm1621, tm1621.jpg
    TM1637, components/display/tm1637, tm1637.jpg
    TM1638, components/display/tm1638, tm1638.jpg
    Waveshare E-Paper, components/display/waveshare_epaper, waveshare_epaper.jpg

Touchscreen Components
----------------------

.. imgtable::

    Touchscreen Core, components/touchscreen/index, folder-open.svg, dark-invert
    EKTF2232, components/touchscreen/ektf2232, ektf2232.svg, Inkplate 6 Plus
    Lilygo T5 4.7", components/touchscreen/lilygo_t5_47, lilygo_t5_47_touch.jpg
    TT21100, components/touchscreen/tt21100, esp32-s3-korvo-2-lcd.png

Cover Components
----------------

.. imgtable::

    Cover Core, components/cover/index, folder-open.svg, dark-invert
    Template Cover, components/cover/template, description.svg, dark-invert
    Feedback Cover, components/cover/feedback, feedback_cover.svg, dark-invert
    Endstop Cover, components/cover/endstop, electric-switch.svg, dark-invert
    Current-Based Cover, components/cover/current_based, flash.svg, dark-invert
    Time-Based Cover, components/cover/time_based, timer.svg, dark-invert
    Custom Cover, components/cover/custom, language-cpp.svg, dark-invert
    AM43 Cover, components/cover/am43, am43.jpg
    Tuya Cover, components/cover/tuya, tuya.png

Text Sensor Components
----------------------

.. imgtable::

    Text Sensor Core, components/text_sensor/index, folder-open.svg, dark-invert
    Home Assistant, components/text_sensor/homeassistant, home-assistant.svg, dark-invert
    MQTT Subscribe Text, components/text_sensor/mqtt_subscribe, mqtt.png
    Version, components/text_sensor/version, new-box.svg, dark-invert
    WiFi Info, components/text_sensor/wifi_info, network-wifi.svg, dark-invert
    Ethernet Info, components/text_sensor/ethernet_info, ethernet.svg, dark-invert
    BLE Scanner, components/text_sensor/ble_scanner, bluetooth.svg, dark-invert
    Modbus Text Sensor, components/text_sensor/modbus_controller, modbus.png
    Template Text Sensor, components/text_sensor/template, description.svg, dark-invert
    Custom Text Sensor, components/text_sensor/custom, language-cpp.svg, dark-invert
    Nextion Text Sensor, components/text_sensor/nextion, nextion.jpg
    Tuya Text Sensor, components/text_sensor/tuya, tuya.png
    WL-134 Pet Tag Sensor , components/text_sensor/wl_134, fingerprint.svg, dark-invert
    LibreTiny, components/text_sensor/libretiny, libretiny.svg

Climate Components
------------------

.. imgtable::

    Climate Core, components/climate/index, folder-open.svg, dark-invert
    Bang Bang Controller, components/climate/bang_bang, air-conditioner.svg, dark-invert
    Thermostat Controller, components/climate/thermostat, air-conditioner.svg, dark-invert
    Custom Climate, components/climate/custom, language-cpp.svg, dark-invert
    PID Controller, components/climate/pid, function.svg, dark-invert
    IR Remote Climate, components/climate/climate_ir, air-conditioner-ir.svg, dark-invert
    Tuya Climate, components/climate/tuya, tuya.png
    Midea, components/climate/midea, midea.svg
    Anova Cooker, components/climate/anova, anova.png
    BedJet Climate System, components/climate/bedjet, bedjet.png
    Haier Climate, components/climate/haier, haier.svg

Number Components
-----------------

.. imgtable::

    Number Core, components/number/index, folder-open.svg, dark-invert
    Modbus Number, components/number/modbus_controller, modbus.png
    Template Number, components/number/template, description.svg, dark-invert
    Tuya Number, components/number/tuya, tuya.png

Select Components
-----------------

.. imgtable::

    Select Core, components/select/index, folder-open.svg, dark-invert
    Template Select, components/select/template, description.svg, dark-invert
    Modbus Select, components/select/modbus_controller, modbus.png
    Tuya Select, components/select/tuya, tuya.png

Lock Components
---------------

.. imgtable::

    Lock Core, components/lock/index, folder-open.svg, dark-invert
    Generic Output Lock, components/lock/output, upload.svg, dark-invert
    Template Lock, components/lock/template, description.svg, dark-invert

Media Player Components
-----------------------

.. imgtable::

    Media Player Core, components/media_player/index, folder-open.svg, dark-invert
    I2S Audio, components/media_player/i2s_audio, i2s_audio.svg

Microphone Components
---------------------

.. imgtable::

    Microphone Core, components/microphone/index, microphone.svg, dark-invert
    I2S Microphone, components/microphone/i2s_audio, i2s_audio.svg

Speaker Components
------------------

.. imgtable::

    Speaker Core, components/speaker/index, speaker.svg, dark-invert
    I2S Speaker, components/speaker/i2s_audio, i2s_audio.svg

Time Components
---------------

.. imgtable::

    Time Core, components/time/index, clock-outline.svg, dark-invert
    Home Assistant Time, components/time/homeassistant, home-assistant.svg, dark-invert
    SNTP, components/time/sntp, clock-outline.svg, dark-invert
    GPS Time, components/time/gps, crosshairs-gps.svg, dark-invert
    DS1307 RTC, components/time/ds1307, clock-outline.svg, dark-invert
    PCF8563 RTC, components/time/pcf8563, clock-outline.svg, dark-invert
    PCF85063 RTC, components/time/pcf85063, clock-outline.svg, dark-invert

Home Assistant Companion Components
-----------------------------------

.. imgtable::

    Bluetooth Proxy, components/bluetooth_proxy, bluetooth.svg, dark-invert
    Voice Assistant, components/voice_assistant, voice-assistant.svg, dark-invert
    Sensor, components/sensor/homeassistant, home-assistant.svg, dark-invert
    Text Sensor, components/text_sensor/homeassistant, home-assistant.svg, dark-invert
    Binary Sensor, components/binary_sensor/homeassistant, home-assistant.svg, dark-invert

Alarm Control Panel Components
------------------------------

.. imgtable::

    Alarm Control Panel Core, components/alarm_control_panel/index, alarm-panel.svg, dark-invert
    Template Alarm Control Panel, components/alarm_control_panel/template, description.svg, dark-invert

Miscellaneous Components
------------------------

.. imgtable::

    Remote Receiver, components/remote_receiver, remote.svg, dark-invert
    Remote Transmitter, components/remote_transmitter, remote.svg, dark-invert
    Status LED, components/status_led, led-on.svg, dark-invert
    Display Menu Core, components/display_menu/index, folder-open.svg, dark-invert
    LCD Menu, components/display_menu/lcd_menu, lcd_menu.png
    Matrix Keypad, components/matrix_keypad, matrix_keypad.jpg
    Wiegand Reader, components/wiegand, wiegand.jpg
    HTTP Request, components/http_request, connection.svg, dark-invert
    mDNS, components/mdns, radio-tower.svg, dark-invert

    Sun, components/sun, weather-sunny.svg, dark-invert
    GPS, components/gps, crosshairs-gps.svg, dark-invert

    Bluetooth Proxy, components/bluetooth_proxy, bluetooth.svg, dark-invert
    ESP32 BLE Client, components/ble_client, bluetooth.svg, dark-invert
    ESP32 BLE Tracker, components/esp32_ble_tracker, bluetooth.svg, dark-invert
    ESP32 BLE Beacon, components/esp32_ble_beacon, bluetooth.svg, dark-invert

    ESP32 Ethernet, components/ethernet, ethernet.svg, dark-invert
    ESP32 Camera, components/esp32_camera, camera.svg, dark-invert
    ESP32 Camera Web Server, components/esp32_camera_web_server, camera.svg, dark-invert

    I²S Audio, components/i2s_audio, i2s_audio.svg

    Stepper, components/stepper/index, stepper.svg
    Servo, components/servo, servo.svg
    Sprinkler, components/sprinkler, sprinkler-variant.svg, dark-invert
    Grove TB6612FNG, components/grove_tb6612fng, motor.png

    PCA6416A I/O Expander, components/pca6416a, pca6416a.svg
    PCA9554 I/O Expander, components/pca9554, pca9554a.jpg
    PCF8574 I/O Expander, components/pcf8574, pcf8574.jpg
    MAX6956 I/O expander - I²C Bus, components/max6956, max6956.jpg
    MCP230XX I/O Expander - I²C Bus, components/mcp230xx, mcp230xx.svg
    TCA9548A I²C Multiplexer, components/tca9548a, tca9548a.jpg
    MCP23SXX I/O Expander - SPI Bus, components/mcp23Sxx, mcp230xx.svg
    SX1509 I/O Expander, components/sx1509, sx1509.jpg
    SN74HC165 I/O Expander, components/sn74hc165, sn74hc595.jpg
    SN74HC595 I/O Expander, components/sn74hc595, sn74hc595.jpg
    XL9535 I/O Expander, components/xl9535, xl9535.svg
    SIM800L, components/sim800l, sim800l.jpg
    DFPlayer, components/dfplayer, dfplayer.svg, dark-invert
    Captive Portal, components/captive_portal, wifi-strength-alert-outline.svg, dark-invert
    Improv via BLE, components/esp32_improv, improv.svg, dark-invert
    Improv via Serial, components/improv_serial, improv.svg, dark-invert
    Debug Component, components/debug, bug-report.svg, dark-invert
    TM1651 Battery Display, components/tm1651, tm1651_battery_display.jpg
    RF Bridge, components/rf_bridge, rf_bridge.jpg
    Tuya MCU, components/tuya, tuya.png
    Modbus Controller, components/modbus_controller, modbus.png
    Exposure Notifications, components/exposure_notifications, exposure_notifications.png
    RTTTL Buzzer, components/rtttl, buzzer.jpg
    Prometheus, components/prometheus, prometheus.svg
    PipSolar - compatible PV Inverter, components/pipsolar, pipsolar.jpg
    Grow Fingerprint Reader, components/fingerprint_grow, fingerprint.svg, dark-invert
    SML, components/sml, sml.svg
    Atlas Scientific Peristaltic Pump, components/ezo_pmp, ezo-pmp.jpg
    Resol VBus, components/vbus, resol_deltasol_bs_plus.jpg
    Demo, components/demo, description.svg, dark-invert
    Copy, components/copy, content-copy.svg, dark-invert

Additional Custom Components
----------------------------

.. imgtable::

    Generic Custom Component, custom/custom_component, language-cpp.svg, dark-invert
    Custom I²C Component, custom/i2c, language-cpp.svg, dark-invert
    Custom SPI Component, custom/spi, language-cpp.svg, dark-invert
    Custom UART Component, custom/uart, language-cpp.svg, dark-invert

.. _cookbook:

Cookbook
--------

.. imgtable::

    Lambda Magic: Tips and Tricks, cookbook/lambda_magic, head-lightbulb-outline.svg, dark-invert
    Garage Door Template Cover, cookbook/garage-door, garage-variant.svg, dark-invert
    Time & Temperature on OLED Display, cookbook/display_time_temp_oled, display_time_temp_oled_2.jpg
    ESP32 Water Leak Detector, cookbook/leak-detector-m5stickC, leak-detector-m5stickC_main_index.jpg
    BME280 Environment extras, cookbook/bme280_environment, bme280.jpg
    Non-Invasive Power Meter, cookbook/power_meter, power_meter.jpg
    Sonoff Fishpond Pump, cookbook/sonoff-fishpond-pump, cookbook-sonoff-fishpond-pump.jpg
    Arduino Port Extender, cookbook/arduino_port_extender, arduino_logo.svg
    EHMTX a matrix status/text display, cookbook/ehmtx, ehmtx.jpg
    Share data directly between ESPHome nodes, cookbook/http_request_sensor, connection.svg, dark-invert

Do you have other awesome automations or cool setups? Please feel free to add them to the
documentation for others to copy. See :doc:`Contributing </guides/contributing>`.

If you'd like to share configurations for specific devices, please contribute to our `ESPHome Devices <https://devices.esphome.io/>`__ database.

.. toctree::
    :hidden:

    web-api/index
    components/index
    cookbook/index
    devices/index
    guides/index
    changelog/index
    custom/index
    images/index
