AC Dimmer Component
===================

.. seo::
    :description: Instructions for setting up AC Dimmer component in ESPHome.
    :image: ac_dimmer.svg

.. warning::

    This component has not been fully tested yet, if you are testing this component
    please share your experience with the dimmer hardware and light model and
    configuration here https://github.com/esphome/feature-requests/issues/278

    Thanks!

The ``ac_dimmer`` component allows you to connect a dimmable light or other load
which supports phase control dimming to your ESPHome project.

There are several already made boards which are compatible with this component, such as the
`RobotDyn dimmer <https://robotdyn.com/ac-light-dimmer-module-1-channel-3-3v-5v-logic-ac-50-60hz-220v-110v.html>`__.

.. figure:: images/robotdyn_dimmer.jpg
    :align: center
    :width: 50.0%

    RobotDyn Module. Image by `RobotDyn`_

.. _RobotDyn: https://robotdyn.com/ac-light-dimmer-module-1-channel-3-3v-5v-logic-ac-50-60hz-220v-110v.html

.. code-block:: yaml

    # Example configuration entry
    output:
      - platform: ac_dimmer
        id: dimmer1
        gate_pin: GPIOXX
        zero_cross_pin:
          number: GPIOXX
          mode:
            input: true
          inverted: yes
        max_dimmer: 0.9
    light:
      - platform: monochromatic
        output: dimmer1
        name: Dimmerized Light

Configuration variables:
------------------------

- **gate_pin** (**Required**, :ref:`config-pin`): The pin used to control the Triac or
  Mosfet.
- **zero_cross_pin** (**Required**, :ref:`config-pin`): The pin used to sense the AC
  Zero cross event, you can have several dimmers controlled with the same zero cross
  detector, in such case duplicate the ``zero_cross_pin`` config on each output.
- **method** (*Optional*): Set the method for dimming, can be:

  - ``leading pulse``: (default) a short pulse to trigger a triac.
  - ``leading pulse double``: trigger the triac twice, if the zero crossing sensor does not fire twice
  - ``leading``: gate pin driven high until the zero cross is detected
  - ``trailing``: gate pin driven high from zero cross until dim period, this method
    is suitable for mosfet dimmers only.

- **init_with_half_cycle** (*Optional*, boolean): Will send the first full half AC cycle
  Try to use this for dimmable LED lights, it might help turning on at low brightness
  levels. On Halogen lamps it might show at initial flicker. Defaults to ``false``.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.
- **max_dimmer** (*Optional*): Limit the dimming between this number and 99%. See below.
- All other options from :ref:`Output <config-output>`.

Dimming lights with phase control can be tricky, the minimum level your light turns on
might be different from other lights, also the perceived light level might not correlate
to the percentage output set to the light, to try to minimize these behaviors you can
tweak the values ``min_power`` from this output component and also ``gamma_correct`` from
the monochromatic light.

Some dimmers, such as the Etekcity ESWD16, trigger the zero crossing pin only on the rising crossing
and not the falling one.  In those cases, use ``leading pulse double`` to trigger the triac twice, once
in the first half of the cycle and again in the second half.

Certain dimmers do not dim correctly between numbers directly below 100% and a lower number. Use the
``max_dimmer`` setting to clamp the dimming to a maximum as it approaches 100%.  At 100%, the gate
will be held on and the dimming clamp will switch off.

See Also
--------

- :doc:`/components/output/index`
- :doc:`/components/light/monochromatic`
- :apiref:`ac_dimmer/ac_dimmer.h`
- :ghedit:`Edit`
