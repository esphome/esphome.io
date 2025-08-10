Modem Sensor
============

.. seo::
    :description: Fetch numeric values from a modem.

The ``modem`` sensor platform allows you to query the :doc:`/components/modem` for specific values.

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
        

Configuration variables:
------------------------

- **rssi** (*Optional*): Received Signal Strength Indicator (RSSI) in dB. The range is from -113 dB (weakest) to -51 dB (strongest). All options from :ref:`Sensor <config-sensor>`.
- **ber** (*Optional*): Bit Error Rate (BER) in percent (%). This may not be available on all modem models. All options from :ref:`Sensor <config-sensor>`.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to poll the modem for new values. Defaults to ``60s``.
- All other options from :ref:`Sensor <config-sensor>`.


See Also
--------

- :doc:`/components/modem`
- :doc:`/components/text_sensor/modem`
- :ref:`sensor-filters`
- :ghedit:`Edit`
