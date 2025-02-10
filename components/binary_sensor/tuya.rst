Tuya Binary Sensor
==================

.. seo::
    :description: Instructions for setting up a Tuya device binary sensor.

The ``tuya`` binary sensor platform creates a binary sensor from a
tuya component and requires :doc:`/components/tuya` to be configured.

You can create the binary sensor as follows:

.. code-block:: yaml

    # Create a binary sensor
    binary_sensor:
      - platform: "tuya"
        name: "MyBinarySensor"
        sensor_datapoint: 1

Configuration variables:
------------------------

- **sensor_datapoint** (**Required**, int): The datapoint id number of the binary sensor.
- All other options from :ref:`Binary Sensor <config-binary_sensor>`.

See Also
--------

- :doc:`/components/tuya`
- :doc:`/components/binary_sensor/index`
- :apiref:`tuya/binary_sensor/tuya_binary_sensor.h`
- :ghedit:`Edit`
