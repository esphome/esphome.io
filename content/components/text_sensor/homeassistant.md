Home Assistant Text Sensor
==========================

.. seo::
    :description: Instructions for setting up Home Assistant text sensors with ESPHome that import states from your Home Assistant instance.
    :image: home-assistant.svg

The ``homeassistant`` text sensor platform allows you to create sensors that import
states from your Home Assistant instance using the :doc:`native API </components/api>`.

.. note::

    Although you might not plan to *export* states from the node and you do not need an entity of the node
    in Home Assistant, this component still requires you to register the node under Home Assistant. See:
    :ref:`connecting-your-device-to-home-assistant`.

.. code-block:: yaml

    # Example configuration entry
    text_sensor:
      - platform: homeassistant
        id: weather_fom_ha
        entity_id: sensor.weather_forecast

Entity state attributes can also be imported:

.. code-block:: yaml

    # Example configuration entry
    text_sensor:
      - platform: homeassistant
        id: effect
        entity_id: light.led_strip
        attribute: effect

Configuration variables:
------------------------

- **entity_id** (**Required**, string): The entity ID to import from Home Assistant.
- **attribute** (*Optional*, string): The name of the state attribute to import from the
  specified entity. The entity state is used when this option is omitted.
- All other options from :ref:`Text Sensor <config-text_sensor>`.

See Also
--------

- :ref:`sensor-filters`
- :ref:`automation`
- :apiref:`homeassistant/text_sensor/homeassistant_text_sensor.h`
- :ghedit:`Edit`
