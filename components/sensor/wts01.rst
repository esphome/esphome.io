WTS01 Temperature Sensor
========================

.. seo::
    :description: Instructions for setting up WTS01 temperature sensors in ESPHome.
    :image: wts01.png
    :keywords: WTS01, Sonoff, TH Origin, TH Elite, THR316, THR320, THR316D, THR320D

The ``wts01`` sensor platform allows you to use WTS01 temperature sensors with ESPHome. 
This is the sensor used in Sonoff TH Origin (THR316, THR320) and TH Elite (THR316D, THR320D) devices.

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
          name: "Sonoff TH Temperature"

Configuration variables (wts01):
--------------------------------

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID for this component.
- **uart_id** (*Optional*, :ref:`config-id`): The ID of the UART bus to communicate with the sensor. 
  If not specified, the component will use the default UART bus configured in the ``uart`` section.
- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the sensor and publish updates. Defaults to ``15s``.

The component also accepts all options from :ref:`UART Device <uart>`.

Configuration variables (sensor - wts01):
-----------------------------------------

- **wts01_id** (*Optional*, :ref:`config-id`): The ID of the WTS01 component. 
  Required if you have specified an ID in the ``wts01`` configuration block.
- **temperature** (*Required*): The information for the temperature sensor.

  - **name** (*Optional*, string): The name of the temperature sensor.
  - **accuracy_decimals** (*Optional*, int): The decimal precision for the temperature reading. Defaults to ``1``.
  - **unit_of_measurement** (*Optional*, string): The unit of measurement for the temperature. Defaults to ``°C``.
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
