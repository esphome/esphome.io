Home Assistant Switch
=====================

.. seo::
    :description: Instructions for setting up Home Assistant Switch with ESPHome that import states and allows control via your Home Assistant instance.
    :image: home-assistant.svg

The ``homeassistant`` Switch platform allows you to create Switch that **import**
states and allow **control** via your Home Assistant instance using the :doc:`native API </components/api>`.

.. note::

    Although you might not plan to *export* states from the node and you do not need an entity of the node
    in Home Assistant, this component still requires you to register the node under Home Assistant. See:
    :ref:`connecting-your-device-to-home-assistant`.

.. code-block:: yaml

    # Example configuration entry
    switch:
      - platform: homeassistant
        id: my_cool_switch_from_ha
        entity_id: switch.my_cool_switch

Configuration variables:
------------------------

- **entity_id** (**Required**, string): The entity ID to import / control from Home Assistant.
- All other options from :ref:`Switch <config-switch>`.

Supported domains
-----------------

The following entity domains from Home Assistant are supported by this platform.

- ``automation``
- ``fan``
- ``humidifier``
- ``input_boolean``
- ``light``
- ``remote``
- ``siren``
- ``switch``

See Also
--------

- :ref:`automation`
- :apiref:`homeassistant/switch/homeassistant_switch.h`
- :ghedit:`Edit`
