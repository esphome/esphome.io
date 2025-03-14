A01NYUB Waterproof Ultrasonic Sensor
====================================

.. seo::
    :description: Instructions for setting up A01NYUB waterproof ultrasonic distance sensor in ESPHome.
    :image: a01nyub.jpg
    :keywords: ultrasonic, DFRobot, A01NYUB

This sensor allows you to use A01NYUB waterproof ultrasonic sensor by DFRobot
(`datasheet <https://wiki.dfrobot.com/A01NYUB%20Waterproof%20Ultrasonic%20Sensor%20SKU:%20SEN0313>`__)
with ESPHome to measure distances. This sensor can measure
ranges between 28 centimeters and 750 centimeters with a resolution of 1 milimeter.

Since this sensor reads multiple times per second, :ref:`sensor-filters` are highly recommended.

To use the sensor, first set up an :ref:`uart` with a baud rate of 9600 and connect the sensor to the specified pin.

.. figure:: images/a01nyub-full.jpg
    :align: center
    :width: 50.0%

    A01NYUB Waterproof Ultrasonic Distance Sensor.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: "a01nyub"
        name: "Distance"


Configuration variables:
------------------------

- **uart_id** (*Optional*, :ref:`config-id`): The ID of the :ref:`UART bus <uart>` you wish to use for this sensor.
  Use this if you want to use multiple UART buses at once.
- All other options from :ref:`Sensor <config-sensor>`.

See Also
--------

- :ref:`sensor-filters`
- :ref:`uart`
- :apiref:`a01nyub/a01nyub.h`
- :ghedit:`Edit`
