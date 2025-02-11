Inkbird IBS-TH1, IBS-TH1 Mini, and IBS-TH2 BLE Sensor
=====================================================

.. seo::
    :description: Instructions for setting up Inkbird IBS-TH1/TH2 Bluetooth-based temperature and humidity sensors in ESPHome.
    :image: inkbird_isbth1_mini.jpg
    :keywords: Inkbird, BLE, Bluetooth, IBS-TH1, IBS-TH2

The ``inkbird_ibsth1_mini`` sensor platform lets you track the output of Inkbird IBS-TH1, IBS-TH1 Mini, and IBS-TH2 Bluetooth
Low Energy devices using the :doc:`/components/esp32_ble_tracker`. This component will track the
temperature, external temperature (non mini only), humidity and the battery level of the IBS-TH1 device every time the
sensor sends out a BLE broadcast. Note that contrary to other implementations, ESPHome can track as
many IBS-TH1/TH2 devices at once as you want.

.. note::

    If an external temperature sensor is connected to the IBS-TH1, measurement from the internal sensor is not sent.
    Only one sensor will work at a time.

.. note::

    The external temperature sensor is not supported on the IBS-TH1 Mini or IBS-TH2

.. figure:: images/inkbird_isbth1_mini-full.jpg
    :align: center
    :width: 80.0%

    Inkbird IBS-TH1 Mini Temperature and Humidity Sensor over BLE.

.. figure:: images/inkbird_isbth1_mini-ui.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    esp32_ble_tracker:

    sensor:
      - platform: inkbird_ibsth1_mini
        mac_address: XX:XX:XX:XX:XX:XX
        temperature:
          name: "Inkbird IBS-TH1 Temperature"
        external_temperature:
          name: "Inkburd IBS-TH1 External Temperature"
        humidity:
          name: "Inkbird IBS-TH1 Humidity"
        battery_level:
          name: "Inkbird IBS-TH1 Battery Level"

Configuration variables:
------------------------

- **mac_address** (**Required**, MAC Address): The MAC address of the Inkbird IBS-TH1 device.
- **temperature** (*Optional*): The information for the temperature sensor.

  - All options from :ref:`Sensor <config-sensor>`.

- **external_temperature** (*Optional*): The information for the external temperature sensor.

  - All options from :ref:`Sensor <config-sensor>`.

- **humidity** (*Optional*): The information for the humidity sensor

  - All options from :ref:`Sensor <config-sensor>`.

- **battery_level** (*Optional*): The information for the battery level sensor

  - All options from :ref:`Sensor <config-sensor>`.


Setting Up Devices
------------------

To set up Inkbird IBS-TH1/TH2 devices you first need to find their MAC Address so that ESPHome can
identify them. So first, create a simple configuration without any ``inkbird_ibsth1_mini`` entries
like so:

.. code-block:: yaml

    esp32_ble_tracker:

After uploading the ESP32 will immediately try to scan for BLE devices such as the Inkbird IBS-TH1/TH2.
When it detects these sensors, it will automatically parse the BLE message print a
message like this one:

.. code::

    [13:36:43][D][esp32_ble_tracker:544]: Found device XX:XX:XX:XX:XX:XX RSSI=-53
    [13:36:43][D][esp32_ble_tracker:565]:   Address Type: PUBLIC
    [13:36:43][D][esp32_ble_tracker:567]:   Name: 'sps'

Note that it can sometimes take some time for the first BLE broadcast to be received. Please note that address type
should say 'PUBLIC' and the device name should be 'sps', this is how you find the Inkbird IBS-TH1/TH2 among all the
other devices.

Then just copy the address (``XX:XX:XX:XX:XX:XX``) into a new ``sensor.inkbird_ibsth1_mini`` platform
entry like in the configuration example at the top.

.. note::

    The ESPHome Inkbird IBS-TH1/TH2 component listens passively to packets the device sends by itself.
    ESPHome therefore has no impact on the battery life of the device.

See Also
--------

- :doc:`/components/esp32_ble_tracker`
- :doc:`/components/sensor/index`
- :doc:`absolute_humidity`
- :apiref:`inkbird_ibsth1_mini/inkbird_ibsth1_mini.h`
- `OpenMQTTGateway <https://github.com/1technophile/OpenMQTTGateway>`__ by `@1technophile <https://github.com/1technophile>`__
- :ghedit:`Edit`
