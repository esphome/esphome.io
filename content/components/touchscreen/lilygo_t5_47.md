Lilygo T5 4.7" Touchscreen
==========================

.. seo::
    :description: Instructions for setting up the Lilygo T5 4.7" Touchscreen with ESPHome
    :image: lilygo_t5_47_touch.jpg
    :keywords: Lilygo T5 4.7" Touchscreen

The ``liygo_t5_47`` touchscreen platform allows using the touchscreen controller
for the Lilygo T5 4.7" e-Paper Display with ESPHome.
The :ref:`I²C <i2c>` is required to be set up in your configuration for this touchscreen to work.

.. code-block:: yaml

    # Example configuration entry
    touchscreen:
      - platform: lilygo_t5_47
        interrupt_pin: GPIOXX


Configuration variables:
------------------------

- **id** (*Optional*, :ref:`config-id`): Manually set the ID of this touchscreen.
- **interrupt_pin** (*Optional*, :ref:`Pin Schema <config-pin_schema>`): The touch detection pin. Must be ``GPIO13``.
- All other options from :ref:`config-touchscreen`.

See Also
--------

- :doc:`Touchscreen <index>`
- :apiref:`lilygo_t5_47/touchscreen/lilygo_t5_47_touchscreen.h`
- :ghedit:`Edit`
