Home Assistant Number
=====================

.. seo::
        :description: Instructions for setting up Home Assistant numbers with ESPHome.
        :image: description.svg

The ``homeassistant`` number platform allows you to create a number that is synchronized
with Home Assistant. Min, Max and Step are not configurable for this platform because they are taken from the Home Assistant entity.

.. note::

    Although you might not plan to *export* states from the node and you do not need an entity of the node
    in Home Assistant, this component still requires you to register the node under Home Assistant. See:
    :ref:`connecting-your-device-to-home-assistant`.

.. code-block:: yaml

    # Example configuration entry
    number:
      - platform: homeassistant
        id: my_ha_number
        entity_id: number.my_number

Configuration variables:
------------------------

- **entity_id** (**Required**, string): The Home Assistant entity ID of the number to synchronize with.
- All other options from :ref:`Number <config-number>`.

``number.set`` Action
---------------------

You can also set the number for the Home Assistant number from elsewhere in your YAML file
with the :ref:`number-set_action`.

See Also
--------

- :ref:`automation`
- :apiref:`homeassistant/number/homeassistant_number.h`
- :ghedit:`Edit`
