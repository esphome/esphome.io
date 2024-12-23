.. _switch-binary-sensor:

Switch Binary Sensor
====================

.. seo::
    :description: Instructions for setting up switch binary sensors with ESPHome.

The Switch Binary Sensor platform allows you to view the state of any switch component as a
read-only binary sensor.

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: switch
        name: "Output state"
        source_id: relay1

    switch:
      - platform: gpio
        id: relay1
        pin: GPIOXX

Configuration variables:
------------------------

- **source_id** (**Required**, :ref:`config-id`): The source switch to observe.
- All other options from :ref:`Binary Sensor <config-binary_sensor>`.

See Also
--------

- :doc:`/components/binary_sensor/index`
- :apiref:`switch/binary_sensor/switch_binary_sensor.h`
- :ghedit:`Edit`
