WiFi Signal Sensor
==================

.. seo::
    :description: Instructions for setting up WiFi signal sensors that track the RSSI connection strength value to the network.
    :image: network-wifi.svg

The ``wifi_signal`` sensor platform allows you to read the signal
strength of the currently connected :doc:`WiFi Access Point </components/wifi>`.

The sensor value is the `"Received signal strength indication" <https://en.wikipedia.org/wiki/Received_signal_strength_indication>`__
measured in decibel-milliwatts (dBm). These values are always negative and the closer they are to zero, the better the signal is.

.. figure:: images/wifi_signal-ui.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: wifi_signal
        name: "WiFi Signal Sensor"
        update_interval: 60s

To additionally display signal strength in percentage use the :ref:`copy-sensor` (it's not possible to add the same sensor twice, because it has a static ``uniqueid`` reported to Home Assistant):

.. code-block:: yaml

    # Example configuration entry with 2 sensors and filter
    sensor:
      - platform: wifi_signal # Reports the WiFi signal strength/RSSI in dB
        name: "WiFi Signal dB"
        id: wifi_signal_db
        update_interval: 60s
        entity_category: "diagnostic"

      - platform: copy # Reports the WiFi signal strength in %
        source_id: wifi_signal_db
        name: "WiFi Signal Percent"
        filters:
          - lambda: return min(max(2 * (x + 100.0), 0.0), 100.0);
        unit_of_measurement: "Signal %"
        entity_category: "diagnostic"
        device_class: ""

Configuration variables:
------------------------

- **update_interval** (*Optional*, :ref:`config-time`): The interval
  to check the sensor. Defaults to ``60s``.
- All other options from :ref:`Sensor <config-sensor>`.

.. warning::

    Signal strength readings are only available when WiFi is in station mode. Readings are not valid
    if the device is acting as an access point without any station mode connection.

See Also
--------

- :ref:`sensor-filters`
- :doc:`/components/wifi`
- :doc:`/components/text_sensor/wifi_info`
- :apiref:`wifi_signal/wifi_signal_sensor.h`
- :ghedit:`Edit`
