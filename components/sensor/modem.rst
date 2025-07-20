Modem Sensor
============

.. seo::
    :description: Fetch numeric values from a modem.

The ``modem`` sensor platform allows you to query the :doc:`/components/modem` for specific values.
This is especially useful for creating a GNSS device tracker in Home Assistant.

.. note::

    The :doc:`/components/modem` must have ``enable_cmux`` set to **True**.


.. code-block:: yaml

    modem:
      id: atmodem
      rx_pin: GPIO26
      tx_pin: GPIO27
      status_pin: GPIO34
      model: SIM7600
      apn: orange
      enable_cmux: True

    sensor:
    - platform: modem
      rssi:
        name: rssi
      ber:
        name: ber
      latitude:
        name: Latitude
      longitude:
        name: Longitude
      altitude:
        name: Altitude
        

Configuration variables:
------------------------

- **rssi** (*Optional*): Received Signal Strength Indicator (RSSI) in dB. The range is from -113 dB (weakest) to -51 dB (strongest). All options from :ref:`Sensor <config-sensor>`.
- **ber** (*Optional*): Bit Error Rate (BER) in percent (%). This may not be available on all modem models. All options from :ref:`Sensor <config-sensor>`.
- **latitude** (*Optional*): GNSS latitude in degrees. Requires ``enable_gnss: True`` in the :doc:`/components/modem` configuration. All options from :ref:`Sensor <config-sensor>`.
- **longitude** (*Optional*): GNSS longitude in degrees. Requires ``enable_gnss: True`` in the :doc:`/components/modem` configuration. All options from :ref:`Sensor <config-sensor>`.
- **altitude** (*Optional*): GNSS altitude in meters. Requires ``enable_gnss: True`` in the :doc:`/components/modem` configuration. All options from :ref:`Sensor <config-sensor>`.
- **accuracy** (*Optional*): GNSS accuracy in meters. Requires ``enable_gnss: True`` in the :doc:`/components/modem` configuration. All options from :ref:`Sensor <config-sensor>`.
- **course** (*Optional*): GNSS course over ground (COG) in degrees. Requires ``enable_gnss: True`` in the :doc:`/components/modem` configuration. All options from :ref:`Sensor <config-sensor>`.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to poll the modem for new values. Defaults to ``60s``.
- All other options from :ref:`Sensor <config-sensor>`.


Home Assistant Integration
--------------------------

The GNSS data can be used to create a device tracker in Home Assistant. You can use the following blueprint to create the corresponding automation:

.. image:: https://my.home-assistant.io/badges/blueprint_import.svg
   :target: https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgist.github.com%2Foarcher%2F1536cca10957d4a9dc007d25ae97f26c
   :alt: Open your Home Assistant instance and show the blueprint import dialog with a specific blueprint pre-filled.

.. note::

  If you get an "Action device_tracker.see not found" error in Home Assistant, you need to add ``device_tracker:`` to your ``configuration.yaml`` file.


See Also
--------

- :doc:`/components/modem`
- :doc:`/components/text_sensor/modem`
- :ref:`sensor-filters`
- :ghedit:`Edit`
