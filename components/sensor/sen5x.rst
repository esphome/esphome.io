SEN5X and SEN6X Series Environmental sensor
===========================================

.. seo::
    :description: Instructions for setting up SEN5X and SEN6X Series Environmental sensor for PM, RH/T, VOC, NOx, CO2 and HCHO measurements.
    :image: sen54.jpg
    :keywords: Sensirion, SEN50, SEN54, SEN55, SEN5X, SEN60, SEN63C, SEN65, SEN66, SEN68

The ``sen5x`` sensor platform allows you to use your Sensirion `SEN5X Series`_ or `SEN6X Series`_ Environmental sensors with ESPHome.

This component only supports I²C communication thus the :ref:`I²C Bus <i2c>` is required. The SEN5X sensor must be configured for I²C communication. 
The SEN6X sensor only supports I²C communication so no configuration is required.

.. _SEN5X Series: https://sensirion.com/products/catalog/SEK-SEN5x

.. _SEN6X Series: https://sensirion.com/sen6x-air-quality-sensor-platform

.. figure:: images/sen54.jpg
    :width: 50% 

    SEN5X Series

.. code-block:: yaml

    # Example configuration entry for SEN54
    sensor:
      - platform: sen5x
        id: sen54
        model: SEN54  # required
        pm_1_0:
          name: "PM <1µm Weight concentration"
          id: pm_1_0
          accuracy_decimals: 1
        pm_2_5:
          name: "PM <2.5µm Weight concentration"
          id: pm_2_5
          accuracy_decimals: 1
        pm_4_0:
          name: "PM <4µm Weight concentration"
          id: pm_4_0
          accuracy_decimals: 1
        pm_10_0:
          name: "PM <10µm Weight concentration"
          id: pm_10_0
          accuracy_decimals: 1
        temperature:
          name: "Temperature"
          accuracy_decimals: 1
        humidity:
          name: "Humidity"
          accuracy_decimals: 0
        voc:
          name: "VOC"
          algorithm_tuning:
            index_offset: 100
            learning_time_offset_hours: 12
            learning_time_gain_hours: 12
            gating_max_duration_minutes: 180
            std_initial: 50
            gain_factor: 230
        temperature_compensation:
          offset: 0
          normalized_offset_slope: 0
          time_constant: 0
        acceleration_mode: low
        store_baseline: true
        address: 0x69
        update_interval: 10s

.. figure:: images/sen66.jpg
    :width: 50% 

    SEN6X Series

.. code-block:: yaml

    # Example configuration entry for SEN66
    sensor:
      - platform: sen5x
        id: sen66
        model: SEN66
        pm_1_0:
          name: "PM <1µm Weight concentration"
          id: pm_1_0
          accuracy_decimals: 1
        pm_2_5:
          name: "PM <2.5µm Weight concentration"
          id: pm_2_5
          accuracy_decimals: 1
        pm_4_0:
          name: "PM <4µm Weight concentration"
          id: pm_4_0
          accuracy_decimals: 1
        pm_10_0:
          name: "PM <10µm Weight concentration"
          id: pm_10_0
          accuracy_decimals: 1
        temperature:
          name: "Temperature"
          accuracy_decimals: 1
        humidity:
          name: "Humidity"
          accuracy_decimals: 0
        co2:
          name: "CO₂"
          auto_self_calibration: false
          accuracy_decimals: 0
        nox:
          name: "NOx"
          algorithm_tuning:
            index_offset: 100
            learning_time_offset_hours: 12
            learning_time_gain_hours: 12
            gating_max_duration_minutes: 180
            std_initial: 50
            gain_factor: 230
        voc:
          name: "VOC"
        store_baseline: true
        address: 0x69
        update_interval: 10s

Configuration variables:
------------------------
- **model** (***Required***, enum): The model of the connected sensor. It will be validated at runtime. Must be one of the following: SEN50, SEN54, SEN55, SEN60, SEN63C, SEN65, SEN66 or SEN68.

- **pm_1_0** (*Optional*): The mass of fine particles up to 1μm. Readings in µg/m³. Available with all models. All options from :ref:`Sensor <config-sensor>`.

- **pm_2_5** (*Optional*): The mass of fine particles up to 2.5μm. Readings in µg/m³. Available with all models. All options from :ref:`Sensor <config-sensor>`.

- **pm_4_0** (*Optional*): The mass of coarse particles up to 4μm. Readings in µg/m³. Available with all models. All options from :ref:`Sensor <config-sensor>`.

- **pm_10_0** (*Optional*): The mass of coarse particles up to 10μm. Readings in µg/m³. Available with all models. All options from :ref:`Sensor <config-sensor>`.

- **temperature** (*Optional*): Temperature. Only available with SEN54, SEN55, SEN63C, SEN65, SEN66 or SEN68. The sensor will be ignored on unsupported models. All options from :ref:`Sensor <config-sensor>`.

- **humidity** (*Optional*): Relative Humidity. Only available with SEN54, SEN55, SEN63C, SEN65, SEN66 or SEN68. The sensor will be ignored on unsupported models. All options from :ref:`Sensor <config-sensor>`.

- **co2** (*Optional*): Carbon dioxide (CO₂). Only available with SEN63C or SEN66. The sensor will be ignored on unsupported models. All options from :ref:`Sensor <config-sensor>`.

  - **auto_self_calibration** (*Optional*, boolean): True enables automatic CO₂ self calibration. False disables automatic CO₂ calibration. Default is ``true``.
  - **altitude_compensation** (*Optional*, boolean): Enable compensating deviations due to current altitude (in meters). Note: Set altitude_compensation or ambient_pressure_compensation_source but not both.
  - **ambient_pressure_compensation_source** (*Optional*, :ref:`config-id`): Set an external pressure sensor ID used for ambient pressure compensation. The pressure sensor must report pressure in hPa. The correction is applied before updating the state of the CO₂ sensor.

- **voc** (*Optional*): VOC Index. Only available with SEN54, SEN55, SEN65, SEN66 or SEN68. The sensor will be ignored on unsupported models. All options from :ref:`Sensor <config-sensor>`.

  - **algorithm_tuning** (*Optional*): The VOC algorithm can be customized by tuning 6 different parameters.

    - **index_offset** (*Optional*, integer): VOC index representing typical (average) conditions. Allowed values are in range 1 - 250. The default value is 100.
    - **learning_time_offset_hours** (*Optional*, integer): Time constant to estimate the VOC algorithm offset from the history in hours. Past events will be forgotten after about twice the learning time. Allowed values are in range 1 - 1000. The default value is 12 hours.
    - **learning_time_gain_hours** (*Optional*, integer): Time constant to estimate the VOC algorithm gain from the history in hours. Past events will be forgotten after about twice the learning time. Allowed values are in range 1 - 1000. The default value is 12 hours.
    - **gating_max_duration_minutes** (*Optional*, integer): Maximum duration of gating in minutes (freeze of estimator during high VOC index signal). Zero disables the gating. Allowed values are in range 0 - 3000. The default value is 180 minutes.
    - **std_initial** (*Optional*, integer): Initial estimate for standard deviation. Lower value boosts events during initial learning period, but may result in larger device-to-device variations. Allowed values are in range 10 - 5000. The default value is 50.
    - **gain_factor** (*Optional*, integer): Gain factor to amplify or to attenuate the VOC index output. Allowed values are in range 1 - 1000. The default value is 230.

- **nox** (*Optional*): NOx Index. Only available with SEN55, SEN65, SEN66 or SEN68. The sensor will be ignored on unsupported models. All options from :ref:`Sensor <config-sensor>`.

  - **algorithm_tuning** (*Optional*): The NOx algorithm can be customized by tuning 5 different parameters.

    - **index_offset** (*Optional*, integer): NOx index representing typical (average) conditions. Allowed values are in range 1..250. The default value is 1.
    - **learning_time_offset_hours** (*Optional*, integer): Time constant to estimate the NOx algorithm offset from the history in hours. Past events will be forgotten after about twice the  learning time. Allowed values are in range 1..1000. The default value is 12 hour.
    - **learning_time_gain_hours** (*Optional*, integer): Time constant to estimate the NOx algorithm gain from the history in hours. Past events will be forgotten after about twice the learning time. Allowed values are in range 1..1000. The default value is 12 hours.
    - **gating_max_duration_minutes** (*Optional*, integer): Maximum duration of gating in minutes (freeze of estimator during high NOx index signal). Zero disables the gating. Allowed values are in range 0..3000. The default value is 720 minutes.
    - **std_initial** (*Optional*, integer): The initial estimate for standard deviation parameter has no impact for NOx. This parameter is still in place for consistency reasons with the VOC tuning parameters command. This parameter must always be set to 50.
    - **gain_factor** (*Optional*, integer): Gain factor to amplify or to attenuate the VOC index output. Allowed values are in range 1..1000. The default value is 230.

- **hcho** (*Optional*): Formaldehyde (HCHO) in ppb. Only available with SEN68. The sensor will be ignored on unsupported models. All options from :ref:`Sensor <config-sensor>`.

- **auto_cleaning_interval** (*Optional*, integer): The periodic fan-cleaning interval in seconds. Only available with SEN5X series.

- **store_baseline** (*Optional*, boolean): Stores and retrieves the baseline VOC and NOx information for quicker startups. Only available with SEN54, SEN55, SEN65, SEN66 and SEN68. Defaults to ``true``.

- **temperature_compensation** (*Optional*): These parameters allow to compensate temperature effects of the design-in at customer side by applying a custom temperature offset to the ambient temperature. Only available with SEN54 and SEN55.

  - **offset** (*Optional*, integer): Temperature offset [°C]. Defaults to ``0``. Only available with SEN54 and SEN55.
  - **normalized_offset_slope** (*Optional*, integer): Normalized temperature offset slope. Defaults to ``0``. Only available with SEN54 and SEN55.
  - **time_constant** (*Optional*, integer): Time constant in seconds. Defaults to ``0``. Only available with SEN54 and SEN55.

- **acceleration_mode** (*Optional*, enum): Allowed value are ``low``, ``medium`` and ``high``. Defaults ``low``. Note: Only works with with SEN54 and SEN55 sensors.

  By default, the RH/T acceleration algorithm is optimized for a sensor which is positioned in free air. If the sensor is integrated into another device, the ambient RH/T output values might not be optimal due to different thermal behavior.
  This parameter can be used to adapt the RH/T acceleration behavior for the actual use-case, leading in an improvement of the ambient RH/T output accuracy. There is a limited set of different modes available.
  Medium and high accelerations are particularly indicated for air quality monitors which are subjected to large temperature changes. Low acceleration is advised for stationary devices not subject to large variations in temperature.

- **address** (*Optional*, integer): Manually specify the I²C address of the sensor. Defaults to ``0x69`` for the SEN5X sensors or ``0x6B`` for the SEN6X sensors.

.. note::

    These sensors needs about a minute "warm-up". The VOC and NOx gas index algorithm needs a number of samples before the values stabilize.


Wiring:
-------

Both the SEN5X and SEN6X sensors have a JST GHR-06V-S 6 pin type connector, with a 1.25mm pitch. The cable needs this connector:

.. figure:: images/jst6pin.png
    :align: center
    :width: 50.0%

For the SEN5X sensors:

- Pin 1 - 5V

- Pin 2 - GND

- Pin 3 - SDA

- Pin 4 - SCL

- Pin 5 - SEL, Must be connected to GND, enabling the I²C interface in order to work with this component.

- Pin 6 - no-connect

For the SEN6X sensors:

- Pin 1 - 3.3V

- Pin 2 - GND

- Pin 3 - SDA

- Pin 4 - SCL

- Pin 5 - GND

- Pin 6 - 3.3V


Automatic Cleaning:
-------------------

The SEN5X sensors have an automatic fan-cleaning which will accelerate the built-in fan to maximum speed for 10 seconds in order to blow out the dust accumulated inside the fan. 
The default automatic-cleaning interval is 168 hours (1 week) of uninterrupted use. Switching off the sensor resets this time counter. 
When the module is in Measurement-Mode an automatic fan-cleaning procedure will be triggered periodically following a defined cleaning interval. This will accelerate the fan to maximum speed for 10 seconds to blow out the accumulated dust inside the fan.

- Measurement values are not updated while the fan-cleaning is running.
- The cleaning interval is set to 604,800 seconds (i.e., 168 hours or 1 week).
- The interval can be configured using the Set Automatic Cleaning Interval command.
- Set the interval to 0 to disable the automatic cleaning.
- A sensor reset, resets the cleaning interval to its default value
- If the sensor is switched off, the time counter is reset to 0. Make sure to trigger a cleaning cycle at least every week if the sensor is switched off and on periodically (e.g., once per day).
- The cleaning procedure can also be started manually with the ``start_autoclean_fan`` Action

The SEN6X sensor supports fan cleaning but not the automatic fan cleaning interval. You have to trigger ``sen5x.start_fan_autoclean`` below occasionally.

.. _start_fan_autoclean_action:

``sen5x.start_fan_autoclean`` Action
------------------------------------

This :ref:`action <config-action>` manually starts a fan-cleaning cycle.

.. code-block:: yaml

    on_...:
      then:
        - sen5x.start_fan_autoclean: my_sen66

Humidity Sensor Heater
----------------------

The SEN6X humidity sensor can develop an offset in the humidity reading when exposed to high levels of humidity for extended periods of time. It supports a heater similar to the one in the SHT4X. The difference is no automatic mode mode instead you have to trigger ``sen5x.start_fan_autoclean`` action occasionally.

.. _activate_heater_action:

``sen5x.activate_heater`` Action
--------------------------------

This :ref:`action <config-action>` manually starts the heater. This will turn the heater on at 200mW for 1s.

.. code-block:: yaml

    on_...:
      then:
        - sen5x.activate_heater: my_sen66

CO₂ Calibration and Compensation:
---------------------------------

The CO₂ sensor by default has auto-calibration enabled. Auto-calibration will adjust the minimum measurement over the last week or so to the outdoor average of slightly more than 400 ppm. 
Auto-calibration assumes that you are opening the windows at least once a week. If you don't open the windows then over time the CO₂ level will tend downward. 

If you know your minimums are not going to be 400 ppm then you can disable auto-calibration, and occasionally take the sensor outside for 5 minutes and then force a manual CO₂ calibration.

Only the SEN63C and the SEN66 have a CO₂ sensor.

.. _perform_forced_co2_calibration:

``sen5x.perform_forced_co2_calibration`` Action
-----------------------------------------------

This :ref:`action <config-action>` forces a manual calibration on the CO₂ sensor.

.. code-block:: yaml

    number:
      - platform: template
        id: co2_forced_cal_value
        name: "CO2 Calibration Value"
        device_class: carbon_dioxide
        entity_category: CONFIG
        optimistic: true
        max_value: 1200
        min_value: 400
        step: 1
        initial_value: 420
        set_action:
          - delay: 1s
    button:
      - platform: template
        name: "CO2 Calibrate"
        entity_category: CONFIG
        on_press:
          - sen5x.perform_forced_co2_calibration:
              value: !lambda |-
                float value = id(co2_forced_cal_value).state;
                return value;
              id: sen66_sensor

The CO₂ sensor also supports pressure compensation. You can either add ``ambient_pressure_compensation_source`` to your configuration and the CO₂ will retrieve an updated pressure just before a CO₂ update. Or you can occasionally call the ``sen5x.set_ambient_pressure_compensation`` action.

.. _set_ambient_pressure_compensation:

``sen5x.set_ambient_pressure_compensation`` Action
--------------------------------------------------

This :ref:`action <config-action>` updates the current pressure used in CO₂ pressure compensation. Must be hPa or mbar.

.. code-block:: yaml

    sensor:
      - platform: copy
        id: pressure_to_sen6x
        source_id: pressure
        unit_of_measurement: hPa
        filters:
          - lambda: |-
              // convert Pa to hPa (or mBar)
              return x / 100.0;
        on_value:
          then:
            - lambda: !lambda |-
                id(sen66_sensor)->set_ambient_pressure_compensation(x);

Altitude based compensation is also available when you set the ``altitude_compensation`` configuration variable to your correct elevation in meters. Note: ``altitude_compensation`` and ``ambient_pressure_compensation_source`` are mutually exclusive. If you plan on using the ``sen5x.set_ambient_pressure_compensation`` action do not set either ``altitude_compensation`` and ``ambient_pressure_compensation_source`` in your configuration.

NOx and VOC Algorithm Tuning
----------------------------

Both the NOx and VOC sensor support algorithm tuning. These variables are set with the ``algorithm_tuning`` configuration under the voc and nox sensors. For more details see `Engineering Guidelines for SEN5X <https://sensirion.com/media/documents/25AB572C/62B463AA/Sensirion_Engineering_Guidelines_SEN5x.pdf>`__

Temperature Compensation:
-------------------------

The SEN54 and SEN55 contain and internal temperature compensation mechanism. The compensated ambient temperature is calculated as follows:

    T_Ambient_Compensated = T_Ambient + (slope*T_Ambient) + offset

Where slope and offset are the values set with ``temperature_compensation`` configuration variables, smoothed with the specified time constant, also a ``temperature_compensation`` configuration variable. The time constant is how fast the slope and offset are applied. After the specified value in seconds, 63% of the new slope and offset are applied.

The STAR (Sensirion Temperature Acceleration Routine) engine set with ``acceleration_mode`` configuration variable changes the responsiveness of both the temperature and humidity sensors.

More details about the tuning of these parameters are included in the application note `Temperature Acceleration and Compensation Instructions for SEN5x. <https://sensirion.com/media/documents/9B9DE2A7/61E957EB/Sensirion_Temperature_Acceleration_and_Compensation_Instructions_SEN.pdf>`__


The SEN63C, SEN65, SEN66 and SEN68 also support temperature compensation but Sensirion has not yet released the promised "Temperature Acceleration and Compensation Instructions for SEN6x" document. While temperature compensation is similar to the SEN5X it not the same. So the current ESPHome component does not yet support Temperature Compensation for SEN6X sensors

See Also
--------

- :ref:`sensor-filters`
- :doc:`absolute_humidity`
- :doc:`sds011`
- :doc:`pmsx003`
- :doc:`ccs811`
- :doc:`scd4x`
- :doc:`sps30`
- :doc:`sgp4x`
- :doc:`sht4x`
- :apiref:`sen5x/sen5x.h`
- :ghedit:`Edit`
