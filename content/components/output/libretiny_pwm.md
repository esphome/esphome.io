LibreTiny PWM Output
====================

.. seo::
    :description: Instructions for setting up LibreTiny hardware PWMs.
    :image: pwm.png

The LibreTiny PWM platform allows you to use a hardware PWM on BK72xx and RTL87xx chips.
Refer to `LibreTiny/Boards <https://docs.libretiny.eu/link/boards>`__ to find your board
and which PWM pins it supports.

.. code-block:: yaml

    # Example configuration entry
    output:
      - platform: libretiny_pwm
        pin: P8
        frequency: 1000 Hz
        id: pwm_output

    # Example usage in a light
    light:
      - platform: monochromatic
        output: pwm_output
        name: "Kitchen Light"

Configuration variables:
------------------------

- **pin** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The pin to use PWM on.
- **id** (**Required**, :ref:`config-id`): The id to use for this output component.
- **frequency** (*Optional*, frequency): The frequency to run the PWM with. Lower frequencies
  have more visual artifacts, but can represent much more colors. Defaults to ``1000 Hz``.
- All other options from :ref:`Output <config-output>`.

.. _output-libretiny_pwm-set_frequency_action:

``output.libretiny_pwm.set_frequency`` Action
---------------------------------------------

This :ref:`Action <config-action>` allows you to manually change the frequency of a LibreTiny PWM
channel at runtime. Use cases include controlling a passive buzzer (for pitch control).

.. code-block:: yaml

    on_...:
      - output.libretiny_pwm.set_frequency:
          id: pwm_output
          frequency: 100Hz

Configuration variables:

- **id** (**Required**, :ref:`config-id`): The ID of the PWM output to change.
- **frequency** (**Required**, :ref:`templatable <config-templatable>`, float): The frequency
  to set in hertz.

See Also
--------

- :doc:`/components/libretiny`
- :doc:`/components/output/index`
- :doc:`/components/light/monochromatic`
- :doc:`/components/fan/speed`
- :doc:`/components/power_supply`
- :apiref:`libretiny_pwm/libretiny_pwm.h`
- :ghedit:`Edit`
