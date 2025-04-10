WTS01 Temperature Sensor
========================

.. seo::
    :description: Instructions for setting up WTS01 temperature sensors in ESPHome.
    :image: wts01.png
    :keywords: WTS01, Sonoff, TH Elite, THR316, THR320, THR316D, THR320D

The ``wts01`` sensor platform allows you to use WTS01 temperature sensors with ESPHome. 
This is the sensor used in Sonoff TH Elite devices (THR316, THR320, THR316D, THR320D).

The sensor communicates with the microcontroller via :doc:`UART </components/uart>`.

.. figure:: images/wts01-full.png
    :align: center
    :width: 80.0%

    WTS01 Temperature Sensor

.. code-block:: yaml

    # Example configuration entry
    uart:
      id: uart_bus
      tx_pin: GPIO16
      rx_pin: GPIO17
      baud_rate: 9600

    wts01:
      id: wts01_sensor
      uart_id: uart_bus
      update_interval: 15s


    sensor:
      - platform: wts01
        wts01_id: wts01_sensor
        temperature:
          name: "Sonoff TH Elite Temperature"

Configuration variables:
------------------------

- **uart_id** (*Optional*, :ref:`config-id`): The ID of the UART bus to communicate with the sensor.
- **temperature** (*Optional*): The information for the temperature sensor.

  - **name** (*Optional*, string): The name of the temperature sensor.
  - All other options from :ref:`Sensor <config-sensor>`.

- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the sensor. Defaults to ``15s``.

.. note::

    The WTS01 sensor is used in Sonoff TH Elite devices (THR316, THR320, THR316D, THR320D) and connects to the main device using a 4-pin RJ connector.
    This sensor provides temperature readings with 0.1°C resolution.

See Also
--------

- :ref:`sensor-filters`
- :doc:`/components/uart`
- :apiref:`wts01/wts01.h`
- :ghedit:`Edit`
