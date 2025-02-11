UDP Binary Sensor
=================

.. seo::
    :description: Instructions for setting up a UDP binary sensor.
    :image: udp.svg

The ``udp`` binary sensor platform allows you to receive binary sensor data directly from another ESPHome node.

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: udp
        id: switch_status
        provider: light-switch
        remote_id: light_switch

Configuration variables
-----------------------

-  **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.
-  **provider** (**Required**, string): The name of the provider node.
-  **remote_id** (*Optional*, :ref:`config-id`): The ID of the original binary sensor in the provider device. If not specified defaults to the ID configured with ``id:``.
-  **name** (*Optional*, string): The name of the binary sensor.
-  **internal** (*Optional*, boolean): Whether the sensor should be exposed via API (e.g. to Home Assistant.) Defaults to ``true`` if name is not set, required if name is provided.
-  All other options from :ref:`Binary Sensor <config-binary_sensor>`.

At least one of ``id`` and ``remote_id`` must be configured.

Publishing to Home Assistant
----------------------------

Typically this type of binary sensor would be used for internal automation purposes rather than having it published back to
Home Assistant, since it would be a duplicate of the original sensor.

If it *is* desired to expose the binary sensor to Home Assistant, then the ``internal:`` configuration setting needs to be explicitly
set to ``false`` and a name provided.
Only the state (i.e. binary value) of the remote sensor is received by the consumer, so any other attributes must be explicitly
configured.

See Also
--------

- :doc:`/components/udp`
- :doc:`/components/sensor/index`
- :ref:`automation`
- :apiref:`udp/udp_component.h`
- :ghedit:`Edit`
