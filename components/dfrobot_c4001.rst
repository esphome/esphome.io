DFRobot mmWave C4001 Radar
====================

.. seo::
    :description: Instructions for setting up DFRobot mmWave C4001 Radar
    :image: dfrobot_sen0609-full.jpg
    :keywords: mmWave

The DFRobot C4001 (SEN0609 or SEN0610) is a millimeter-wave presence detector. The C4001 millimeter-wave presence sensor 
has the advantage of being able to detect both static and moving objects. It also has a relatively strong anti-interference 
ability, making it less susceptible to factors such as temperature changes, variations in ambient light, and environmental noise. 
Whether a person is sitting, sleeping, or in motion, the sensor can quickly detect their presence.

There are two variants:

+ SEN0609 has a 100° horizontal and 40° vertical field of view, 16 meter presence detection range and 25 meter motion detection range.
+ SEN0610 has a 100° horizontal and 80° vertical field of view, 8 meter presence detection range and 12 meter motion detection range.

..  note::
    Some settings have different ranges depending on the variant used. This component treats both variants the same, so it is your responsibility to make sure your configuration sets these values appropriately.

The sensor can operate in one of two modes, ```Presence``` and ```Speed and Distance```. In ```Presence``` mode the sensor provides a singular occupancy output. 
The presence output once presence is detected will stay on for a period that can be configured. In ```Speed and Distance``` mode the occupancy binary sensor indicates if a target is being tracked or not. 
Each time the sensor indicates presence it also outputs target distance, target speed and target energy. In ```Speed and Distance``` mode all of these parameter update frequently. 
There are only two settings for this mode, micro_motion_enable switch and threshold_factor number.

The C4001 sensor maintains settings in flash. When powered on these settings are loaded from flash and made operational. To change the configuration of the sensor dial in the setting you need and hit the config_save button. 
This will tell the sensor to store the new settings in flash and make them operational. You only need to do this once.

More information on the C4001 (SEN0609) sensor is available [here](https://www.dfrobot.com/product-2793.html). Information on the C4001 (SEN0610) sensor is available [here](https://www.dfrobot.com/product-2795.html).


.. figure:: images/dfrobot_sen0609.jpg
    :align: center
    :width: 75%

    DFRobot mmWave C4001 (SEN0609) Radar / Presence Detection Sensor

.. code-block:: yaml

  # Sample configuration entry example
  external_components:
    - source:
        type: git
        url: https://github.com/mikelawrence/esphome-components
      components: [ dfrobot_c4001 ]

  dfrobot_c4001:
    id: mmwave_sensor
    uart_id: mmwave_uart
    mode: PRESENCE

  binary_sensor:
    - platform: dfrobot_c4001
      config_changed:
        name: Config Changed
      occupancy:
        id: occupancy_uart
        name: Occupancy via UART
        
  button:
    - platform: dfrobot_c4001
      config_save:
        name: Config Save
        entity_category: CONFIG

  number:
    - platform: dfrobot_c4001
      dfrobot_c4001_id: mmwave_sensor
      max_range:
        name: Range Max
      min_range:
        name: Range Min
      trigger_range:
        name: Range Trigger
      hold_sensitivity:
        name: Sensitivity Hold
      trigger_sensitivity:
        name: Sensitivity Trigger
      on_latency:
        name: Latency On
      off_latency:
        name: Latency Off
      inhibit_time:
        name: Inhibit Time

  switch:
    - platform: dfrobot_c4001
      dfrobot_c4001_id: mmwave_sensor
      led_enable:
        name: Enable LED


Hub Component
*************

The hub component ``dfrobot_c4001:`` used use to define the ```mode`` of the sensor. When you define ``dfrobot_c4001:`` you'll need to have a ``uart:`` entry in
your configuration with both the TX and RX pins defined and the baud rate must be set to ``9600``.

Multiple instances of this component may be defined if multiple :doc:`/components/uart` components are available:

.. code-block:: yaml

  dfrobot_c4001:
    id: mmwave_sensor
    uart_id: mmwave_uart
    mode: PRESENCE
    flip_x_axis: false
    
    ...

Configuration variables
***********************

- **mode** (*Required*, enumeration): This sets the operation mode of the sensor. Options are ``PRESENCE`` and ``SPEED_AND_DISTANCE``.

Binary Sensor
*************

.. code-block:: yaml

  binary_sensor:
    - platform: dfrobot_c4001
      config_changed:
        name: Config Changed
      occupancy:
        id: occupancy_uart
        name: Occupancy via UART

Configuration variables:
************************

- **config_changed** (*Optional*): When ``true`` the current sensor configuration has been changed but not saved to the sensor. 
  All Options from :ref:`Switch <config-binary_sensor>`.
- **occupancy** (*Optional*): In ``PRESENCE`` mode this indicates presence. In ``SPEED_AND_DISTANCE`` mode this indicates a target is being tracked. 
  All Options from :ref:`Switch <config-binary_sensor>`.

Button
*************

.. code-block:: yaml

  button:
    - platform: dfrobot_c4001
      config_save:
        name: Config Save

Configuration variables:
************************

- **config_save** (*Optional*): When you click this button the current configuration will be saved. All Options from [Button Component](https://esphome.io/components/button/index.html#base-button-configuration).

.. warning::

    Each change to the configuration of the mmWave radar triggers a write to its internal flash/EEPROM.
    Write cycles to this memory are limited, so avoid the practice of changing settings frequently.
    Determine the appropriate settings for your device and avoid changing them unless absolutely necessary.

Numbers
*******

.. code-block:: yaml

  number:
    - platform: dfrobot_c4001
      dfrobot_c4001_id: mmwave_sensor
      max_range:
        name: Range Max
      min_range:
        name: Range Min
      trigger_range:
        name: Range Trigger
      hold_sensitivity:
        name: Sensitivity Hold
      trigger_sensitivity:
        name: Sensitivity Trigger
      on_latency:
        name: Latency On
      off_latency:
        name: Latency Off
      inhibit_time:
        name: Inhibit Time

Configuration variables:
************************

- **min_range** (*Optional*): This is the minimum detection range. Default is 0.6 meters (m) with a range of 0.6 to 25.0 m. The manual recommends not changing this value. 
  The ```config_save``` button must be clicked to save the sensor configuration to flash and make operational. Available only in ``PRESENCE`` mode. 
  All Options from :ref:`Switch <config-number>`.
- **max_range** (*Optional*): This is the maximum detection range. Default is 6 meters (m) with a range of 0.6 to 25.0 m. The ``config_save`` button must be clicked to save the sensor configuration to flash and make operational. 
  Available only in ``PRESENCE`` mode. All Options from :ref:`Switch <config-number>`.
- **trigger_range** (*Optional*): Sets the maximum range at which occupancy can switch to present. The range between max detection range and trigger detection range can NOT cause occupancy to switch to present.
  Default is 0.6 meters (m) with a range of 0.6 to 25.0 m. The ``config_save`` button must be clicked to save the sensor configuration to flash and make operational. Available only in ``PRESENCE`` mode. 
  All Options from :ref:`Switch <config-number>`.
- **hold_sensitivity** (*Optional*): The number represents the ease in which the sensor switches to the present state when someone enters the sensing range of the sensor. 
  Default is 7 (no units) with a range of 0 to 9, higher is more sensitive. The ``config_save`` button must be clicked to save the sensor configuration to flash and make operational. 
  Available only in ``PRESENCE`` mode. All Options from :ref:`Switch <config-number>`.
- **trigger_sensitivity** (*Optional*): This number represents ease of continued presence detection after the sensor switched to the present state. 
  Default is 5 (no units) with a range of 0 to 9, higher is more sensitive. The ``config_save`` button must be clicked to save the sensor configuration to flash and make operational.
  Available only in ``PRESENCE`` mode. All Options from :ref:`Switch <config-number>`.
- **on_latency** (*Optional*): This time value is how long presence is detected before switching to the present state. Default is 0.050 (seconds) with a range of 0.0 to 100.0. 
  The ``config_save`` button must be clicked to save the sensor configuration to flash and make operational. Available only in ``PRESENCE`` mode. 
  All Options from :ref:`Switch <config-number>`.
- **off_latency** (*Optional*): This time value is how long the after the sensor no longer detects presence before switching to the not present state.
  Default is 15 (seconds) with a range of 0 to 1500. The ``config_save`` button must be clicked to save the sensor configuration to flash and make operational. 
  Available only in ``PRESENCE`` mode. All Options from :ref:`Switch <config-number>`.
- **inhibit_time** (*Optional*): The dead-time after switching to the not present state before presence can be detected again. Default is 1 (seconds) with a range of 0.1 to 255.0. 
  The ``config_save`` button must be clicked to save the sensor configuration to flash and make operational. Available only in ``PRESENCE`` mode. All Options from :ref:`Switch <config-number>`.
- **threshold_factor** (*Optional*): The larger the number the larger the object and more motion is required to trigger the sensor to switch to target tracked state. 
  Default is 5 with a range of 0 to 65535. The ```config_save``` button must be clicked to save the sensor configuration to flash and make operational. Available only in ``SPEED_AND_DISTANCE`` mode. All Options from :ref:`Switch <config-number>`.

Switch
******

.. code-block:: yaml

  switch:
    - platform: dfrobot_c4001
      dfrobot_c4001_id: mmwave_sensor
      led_enable:
        name: Enable LED
      micro_motion_enable:
        name: Micro Motion Enable

Configuration variables:
************************

- **led_enable** (*Optional*): When turned on the green LED will flash when the sensor has been started. The blue LED cannot be disabled with this command. All Options from :ref:`Switch <config-switch>`.
- **micro_motion_enable** (*Optional*): Turns on micro motion mode. Available only in ``SPEED_AND_DISTANCE`` mode. All Options from :ref:`Switch <config-switch>`.

Sensors
******

.. code-block:: yaml

  sensor:
    - platform: dfrobot_c4001
      dfrobot_c4001_id: mmwave_sensor
      target_distance:
        name: Target Distance
      target_speed:
        name: Target Speed
      target_energy:

Configuration variables:
************************

- **target_distance** (*Optional*): When **occupancy** binary sensor is ``true`` this sensor indicates distance to target in meters (m). When **occupancy** binary sensor is ```false``` this sensor switches to 0.0 indicating invalid data. 
  Available only in ``SPEED_AND_DISTANCE`` mode. All Options from :ref:`Switch <config-sensor>`. 
- **target_speed** (*Optional*): When **occupancy** binary sensor is ``true`` this sensor indicates target speed in meters per second (m/s). When **occupancy** binary sensor is ```false``` this sensor switches to 0.0 indicating invalid data. 
  Available only in ``SPEED_AND_DISTANCE`` mode. All Options from :ref:`Switch <config-sensor>`.
- **target_energy** (*Optional*): When **occupancy** binary sensor is ``true`` this sensor indicates target energy in no units. When **occupancy** binary sensor is ```false``` this sensor switches to 0.0 indicating invalid data. 
  Available only in ``SPEED_AND_DISTANCE`` mode. All Options from :ref:`Switch <config-sensor>`.


Actions
*******

``dfrobot_c4001.factory_reset`` Action
***********************************

.. code-block:: yaml

  # using automations
  button:
    - platform: template
      name: Factory Reset
      on_press:
        - dfrobot_c4001.factory_reset: mmwave_sensor
      entity_category: CONFIG

  # using lambdas
  - lambda: |-
  id(mmwave_sensor).factory_reset();

Will perform a factory reset of the module and all configuration values will go back to default. The module will restart with these defaults. 

.. warning::

    Each factory reset of the mmWave radar triggers a write to its internal flash/EEPROM.
    Write cycles to this memory are limited, so avoid the practice of resetting frequently.

See Also
--------
- :ref:`UART bus <uart>`
- :apiref:`sen5x/sen5x.h`
- `DFRobot mmWave C4001 (SEN0609) Radar Wiki page <https://wiki.dfrobot.com/SKU_SEN0609_C4001_mmWave_Presence_Sensor_25m>`__
- `DFRobot mmWave C4001 (SEN0610) Radar Wiki page <https://wiki.dfrobot.com/SKU_SEN0610_Gravity_C4001_mmWave_Presence_Sensor_12m_I2C_UART>`__
- :ghedit:`Edit`
