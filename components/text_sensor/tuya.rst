Tuya Text Sensor
================

.. seo::
    :description: Instructions for setting up a Tuya device sensor.
    :image: tuya.png

The ``tuya`` text sensor platform creates a sensor from a tuya component
and requires :doc:`/components/tuya` to be configured.

You can create the text sensor as follows:

.. code-block:: yaml

    # Create a sensor
    text_sensor:
      - platform: "tuya"
        name: "MyTextSensor"
        sensor_datapoint: 18

Configuration variables:
------------------------

- **sensor_datapoint** (**Required**, int): The datapoint id number of the sensor.
- All other options from :ref:`Text Sensor <config-text_sensor>`.

See Also
--------

- :doc:`/components/tuya`
- :doc:`/components/text_sensor/index`
- :apiref:`tuya/text_sensor/tuya_text_sensor.h`
- :ghedit:`Edit`
