UDP Sensor
==========

.. seo::
    :description: Instructions for setting up a UDP sensor.
    :image: udp.svg

The ``udp`` sensor platform allows you to receive numeric sensor data directly from another ESPHome node.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: udp
        id: temperature_id
        provider: thermometer
        remote_id: temp_id

Configuration variables
-----------------------

-  **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.
-  **provider** (**Required**, string): The name of the provider node.
-  **remote_id** (*Optional*, :ref:`config-id`): The ID of the original sensor in the provider node. If not specified defaults to the ID configured with ``id:``.
-  **name** (*Optional*, string): The name of the sensor.
-  **internal** (*Optional*, boolean): Whether the sensor should be exposed via API (e.g. to Home Assistant.) Defaults to ``true`` if name is not set, required if name is provided.
-  All other options from :ref:`Sensor <config-sensor>`.

At least one of ``id`` and ``remote_id`` must be configured. 

Publishing to Home Assistant
----------------------------

Typically this type of sensor would be used for internal automation purposes rather than having it published back to
Home Assistant, since it would be a duplicate of the original sensor.

If it *is* desired to expose the sensor to Home Assistant, then the ``internal:`` configuration setting needs to be explicitly
set to ``false`` and a name provided.
Only the state (i.e. numeric value) of the remote sensor is received by the consumer, so any other attributes must be explicitly
configured.

See Also
--------

- :doc:`/components/udp`
- :doc:`/components/binary_sensor/index`
- :ref:`automation`
- :apiref:`udp/udp_component.h`
- :ghedit:`Edit`
