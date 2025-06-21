.. _output:

Output Component
================

.. seo::
    :description: Instructions for setting up generic outputs in ESPHome
    :image: folder-open.svg

Each platform of the ``output`` domain exposes some output to
ESPHome. These are grouped into two categories: ``binary`` outputs
(that can only be ON/OFF) and ``float`` outputs (like PWM, can output
any rational value between 0 and 1).

.. _config-output:

Base Output Configuration
-------------------------

Each output platform extends this configuration schema.

.. code-block:: yaml

    # Example configuration entry
    output:
      - platform: ...
        id: my_output_id
        power_supply: power_supply_id
        inverted: false
        min_power: 0.01
        max_power: 0.75

Configuration variables:

- **id** (**Required**, :ref:`config-id`): The id to use for this output component.
- **power_supply** (*Optional*, :ref:`config-id`): The :doc:`power
  supply </components/power_supply>` to connect to
  this output. When the output is enabled, the power supply will
  automatically be switched on too.
- **inverted** (*Optional*, boolean): If the output should be treated
  as inverted. Defaults to ``false``.

Float outputs only:

- **min_power** (*Optional*, float): Sets the minimum output value of this output platform.
  Must be in range from 0 to max_power. Defaults to ``0``.  If zero_means_zero is ``false`` this will be output value when the entity is turned off.
- **max_power** (*Optional*, float): Sets the maximum output value of this output platform.
  Must be in range from min_power to 1. Defaults to ``1``.
- **zero_means_zero** (*Optional*, boolean): Sets the output to use actual 0 instead of ``min_power``.
  Defaults to ``false``.


.. _output-turn_on_action:

``output.turn_on`` Action
*************************

This action turns the output with the given ID on when executed.

.. code-block:: yaml

    on_...:
      then:
        - output.turn_on: light_1

.. note::

    This action can also be expressed in :ref:`lambdas <config-lambda>`:

    .. code-block:: cpp

        id(light_1).turn_on();

.. _output-turn_off_action:

``output.turn_off`` Action
**************************

This action turns the output with the given ID off when executed.

.. code-block:: yaml

    on_...:
      then:
        - output.turn_off: light_1

.. note::

    This action can also be expressed in :ref:`lambdas <config-lambda>`:

    .. code-block:: cpp

        id(light_1).turn_off();

.. _output-set_level_action:

``output.set_level`` Action
***************************

This action sets the float output to the given level when executed. Note: This only
works with floating point outputs like :doc:`/components/output/esp8266_pwm`, :doc:`/components/output/ledc`, :doc:`/components/output/sigma_delta_output`, :doc:`/components/output/slow_pwm`.

.. code-block:: yaml

    on_...:
      then:
        - output.set_level:
            id: light_1
            level: 50%

.. note::

    This action can also be expressed in :ref:`lambdas <config-lambda>`:

    .. code-block:: cpp

        // range is 0.0 (off) to 1.0 (on)
        id(light_1).set_level(0.5);

Full Output Index
-----------------

- :doc:`/components/switch/output`
- :doc:`/components/power_supply`
- :doc:`/components/light/binary`
- :doc:`/components/light/monochromatic`
- :doc:`/components/light/rgb`
- :doc:`/components/fan/binary`
- :doc:`/components/fan/speed`
- :apiref:`binary_output.h <output/binary_output.h>`,
  :apiref:`float_output.h <output/float_output.h>`

.. toctree::
    :maxdepth: 1
    :glob:

    *

- :ghedit:`Edit`


