Status Binary Sensor
====================

.. seo::
    :description: Instructions for setting up MQTT status binary sensors.
    :image: server-network.svg

The Status Binary Sensor exposes the node state (if it’s connected to via MQTT/native API)
for Home Assistant.

.. figure:: images/status-ui.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: status
        name: "Living Room Status"

Configuration variables:
------------------------

- All options from :ref:`Binary Sensor <config-binary_sensor>`. (Inverted mode is not supported)

See Also
--------

- :doc:`/components/binary_sensor/index`
- :doc:`/components/mqtt`
- :apiref:`status/status_binary_sensor.h`
- :ghedit:`Edit`
