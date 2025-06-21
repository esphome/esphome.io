Tuya MCU
========

.. seo::
    :description: Instructions for setting up the Tuya component.
    :image: tuya.png

The ``tuya`` component creates a serial connection to the Tuya MCU for platforms to use.

.. figure:: /images/tuya.png
    :align: center
    :width: 40%

The ``tuya`` serial component requires a :ref:`UART bus <uart>` to be configured.
Put the ``tuya`` component in the config and it will list the possible devices for you in the config log.

.. code-block:: yaml

    # Register the Tuya MCU connection
    tuya:


Here is an example output for a Tuya fan controller:

.. code-block:: text

    [12:39:45][C][tuya:023]: Tuya:
    [12:39:45][C][tuya:032]:   Datapoint 1: switch (value: ON)
    [12:39:45][C][tuya:036]:   Datapoint 3: enum (value: 1)
    [12:39:45][C][tuya:036]:   Datapoint 6: enum (value: 0)
    [12:39:45][C][tuya:034]:   Datapoint 7: int value (value: 0)
    [12:39:45][C][tuya:032]:   Datapoint 9: switch (value: OFF)
    [12:39:45][C][tuya:046]:   Product: '{"p":"hqq73kftvzh8c92u","v":"1.0.0","m":0}'

Here is another example output for a Tuya ME-81H thermostat:

.. code-block:: text

    [08:51:09][C][tuya:032]: Tuya:
    [08:51:09][C][tuya:043]:   Datapoint 1: switch (value: ON)
    [08:51:09][C][tuya:045]:   Datapoint 24: int value (value: 220)
    [08:51:09][C][tuya:045]:   Datapoint 16: int value (value: 22)
    [08:51:09][C][tuya:049]:   Datapoint 2: enum (value: 1)
    [08:51:09][C][tuya:045]:   Datapoint 19: int value (value: 40)
    [08:51:09][C][tuya:045]:   Datapoint 101: int value (value: 1)
    [08:51:09][C][tuya:045]:   Datapoint 27: int value (value: -2)
    [08:51:09][C][tuya:049]:   Datapoint 43: enum (value: 1)
    [08:51:09][C][tuya:049]:   Datapoint 102: enum (value: 1)
    [08:51:09][C][tuya:051]:   Datapoint 45: bitmask (value: 0)
    [08:51:09][C][tuya:043]:   Datapoint 10: switch (value: ON)
    [08:51:09][C][tuya:041]:   Datapoint 38: raw (value: 06.00.14.08.00.0F.0B.1E.0F.0C.1E.0F.11.00.16.16.00.0F.08.00.16.17.00.0F (24))
    [08:51:09][C][tuya:049]:   Datapoint 36: enum (value: 1)
    [08:51:09][C][tuya:057]:   GPIO Configuration: status: pin 14, reset: pin 0 (not supported)
    [08:51:09][C][tuya:061]:   Status Pin: GPIO14
    [08:51:09][C][tuya:063]:   Product: '{"p":"gogb05wrtredz3bs","v":"1.0.0","m":0}'

Configuration variables:
------------------------

- **time_id** (*Optional*, :ref:`config-id`): Some Tuya devices support obtaining local time from ESPHome.
  Specify the ID of the :doc:`time/index` which will be used.

- **status_pin** (*Optional*, :ref:`Pin Schema <config-pin_schema>`): Some Tuya devices support WiFi status reporting ONLY through gpio pin.
  Specify the pin reported in the config dump or leave empty otherwise.
  More about this `here <https://developer.tuya.com/en/docs/iot/tuya-cloud-universal-serial-port-access-protocol?id=K9hhi0xxtn9cb#title-6-Query%20working%20mode>`__.

- **ignore_mcu_update_on_datapoints** (*Optional*, list): A list of datapoints to ignore MCU updates for.  Useful for certain broken/erratic hardware and debugging.

Automations:

- **on_datapoint_update** (*Optional*): An automation to perform when a Tuya datapoint update is received. See :ref:`tuya-on_datapoint_update`.

Tuya Automation
---------------

.. _tuya-on_datapoint_update:

``on_datapoint_update``
***********************

This automation will be triggered when a a Tuya datapoint update is received.
A variable ``x`` is passed to the automation for use in lambdas.
The type of ``x`` variable is depending on ``datapoint_type`` configuration variable:

- *raw*: ``x`` is ``std::vector<uint8_t>``
- *string*: ``x`` is ``std::string``
- *bool*: ``x`` is ``bool``
- *int*: ``x`` is ``int``
- *uint*: ``x`` is ``uint32_t``
- *enum*: ``x`` is ``uint8_t``
- *bitmask*: ``x`` is ``uint32_t``
- *any*: ``x`` is :apistruct:`tuya::TuyaDatapoint`

.. code-block:: yaml

    tuya:
      on_datapoint_update:
        - sensor_datapoint: 6
          datapoint_type: raw
          then:
            - lambda: |-
                ESP_LOGD("main", "on_datapoint_update %s", format_hex_pretty(x).c_str());
                id(voltage).publish_state((x[0] << 8 | x[1]) * 0.1);
                id(current).publish_state((x[3] << 8 | x[4]) * 0.001);
                id(power).publish_state((x[6] << 8 | x[7]) * 0.1);
        - sensor_datapoint: 7 # sample dp
          datapoint_type: string
          then:
            - lambda: |-
                ESP_LOGD("main", "on_datapoint_update %s", x.c_str());
        - sensor_datapoint: 8 # sample dp
          datapoint_type: bool
          then:
            - lambda: |-
                ESP_LOGD("main", "on_datapoint_update %s", ONOFF(x));
        - sensor_datapoint: 6
          datapoint_type: any # this is optional
          then:
            - lambda: |-
                if (x.type == tuya::TuyaDatapointType::RAW) {
                  ESP_LOGD("main", "on_datapoint_update %s", format_hex_pretty(x.value_raw).c_str());
                } else {
                  ESP_LOGD("main", "on_datapoint_update %hhu", x.type);
                }

Configuration variables:

- **sensor_datapoint** (**Required**, int): The datapoint id number of the sensor.
- **datapoint_type** (**Required**, string): The datapoint type one of *raw*, *string*, *bool*, *int*, *uint*, *enum*, *bitmask* or *any*.
- See :ref:`Automation <automation>`.


See Also
--------

- :doc:`/components/fan/tuya`
- :doc:`/components/light/tuya`
- :doc:`/components/switch/tuya`
- :doc:`/components/climate/tuya`
- :doc:`/components/binary_sensor/tuya`
- :doc:`/components/sensor/tuya`
- :doc:`/components/text_sensor/tuya`
- :doc:`/components/number/tuya`
- :apiref:`tuya/tuya.h`
- :ghedit:`Edit`
