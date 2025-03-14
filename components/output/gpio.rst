GPIO Output
===========

.. seo::
    :description: Instructions for setting up binary outputs for GPIO pins.
    :image: gpio.svg

The GPIO output component is quite simple: It exposes a single GPIO pin
as an output component. Note that output components are **not** switches and
will not show up in Home Assistant. See :doc:`/components/switch/gpio`.

.. code-block:: yaml

    # Example configuration entry
    output:
      - platform: gpio
        pin: GPIOXX
        id: gpio_d1

Configuration variables:
------------------------

- **pin** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The pin to turn on and off.
- **id** (**Required**, :ref:`config-id`): The id to use for this output component.
- All other options from :ref:`Output <config-output>`.

.. warning::

    This is an **output component** and will not be visible from the frontend. Output components are intermediary
    components that can be attached to for example lights. To have a GPIO pin in the Home Assistant frontend, please
    see the :doc:`/components/switch/gpio`.

See Also
--------

- :doc:`/components/switch/gpio`
- :doc:`/components/output/index`
- :doc:`/components/output/esp8266_pwm`
- :doc:`/components/output/ledc`
- :doc:`/components/light/binary`
- :doc:`/components/fan/binary`
- :doc:`/components/power_supply`
- :apiref:`gpio/output/gpio_binary_output.h`
- :ghedit:`Edit`
