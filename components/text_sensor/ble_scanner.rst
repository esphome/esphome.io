ESP32 Bluetooth Low Energy Scanner
==================================

.. seo::
    :description: Instructions for setting up BLE text sensors for the ESP32.
    :image: bluetooth.svg
    :keywords: ESP32

The ``ble_scanner`` text sensor platform lets you track reachable BLE devices.

See the :ref:`BLE Tracker Configuration variables <config-esp32_ble_tracker>` for instructions for setting up scan parameters.

The sensor platform is similar to :doc:`/components/sensor/ble_rssi` but in contrast to that platform, this text
sensor sends out all raw BLE scan information and does not filter devices.

The data this sensor publishes is intended to be processed by the remote (for example an MQTT client) and sends
the data in JSON format.

.. warning::

    The BLE software stack on the ESP32 consumes a significant amount of RAM on the device.

    **Crashes are likely to occur** if you include too many additional components in your device's
    configuration. Memory-intensive components such as :doc:`/components/voice_assistant` and other
    audio components are most likely to cause issues.

.. code-block:: yaml

    # Example configuration entry
    esp32_ble_tracker:

    text_sensor:
      - platform: ble_scanner
        name: "BLE Devices Scanner"

Example json log:

.. code-block:: json

    {
        "timestamp":1578254525,
        "address": "XX:XX:XX:XX:XX:XX",
        "rssi":"-80",
        "name":"MI Band 2"
    }

Configuration variables:
------------------------

- All options from :ref:`Text Sensor <config-text_sensor>`.

See Also
--------

- :doc:`/components/esp32_ble_tracker`
- :doc:`/components/text_sensor/index`
- :apiref:`ble_scanner/ble_scanner.h`
- :ghedit:`Edit`
