WTS01 Temperature Sensor
========================

.. seo::
    :description: Instructions for setting up WTS01 temperature sensors in ESPHome.
    :image: wts01.png
    :keywords: WTS01, Sonoff, TH Origin, TH Elite, THR316, THR320, THR316D, THR320D

The ``wts01`` platform allows you to use WTS01 temperature sensors with ESPHome. 
This is the sensor used in Sonoff TH Origin (THR316, THR320) and TH Elite (THR316D, THR320D) devices.

For this component to work you need to have set up a UART bus in your configuration - only the RX pin should be necessary.

The sensor communicates with the microcontroller via :doc:`UART </components/uart>`.

.. figure:: images/wts01-full.png
    :align: center
    :width: 80.0%

    WTS01 Temperature Sensor

.. code-block:: yaml

    # You need to have a UART bus setup in your configuration
    uart:
      rx_pin: GPIO17
      baud_rate: 9600

    # Then you can add the WTS01 sensor
    wts01:
      id: wts01_sensor

    sensor:
      - platform: wts01
        wts01_id: wts01_sensor
        temperature:
          name: "WTS01 Temperature"

Configuration variables:
------------------------

- **wts01** (*Required*): The WTS01 sensor configuration.
  
  - **id** (*Required*, :ref:`config-id`): The ID to use for this WTS01 component.

- **sensor** (*Required*): The sensor configuration.
  
  - **platform** (*Required*, string): Must be ``wts01``.
  - **wts01_id** (*Required*, :ref:`config-id`): The ID of the WTS01 component.
  - **temperature** (*Required*): The temperature sensor configuration.
    
    - **name** (*Required*, string): The name of the temperature sensor.
    - All other options from :ref:`Sensor <config-sensor>`.

.. note::

    The WTS01 sensor is used in Sonoff TH Origin (THR316, THR320) and TH Elite (THR316D, THR320D) devices and connects to the main device using a RJ9 4C4P connector.
    This sensor provides temperature readings with 0.1°C resolution.

See Also
--------

- :ref:`sensor-filters`
- :doc:`/components/uart`
- :apiref:`wts01/wts01.h`
- :ghedit:`Edit`
