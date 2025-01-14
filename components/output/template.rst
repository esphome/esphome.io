Template Output
===============

.. seo::
    :description: Instructions for setting up template outputs with ESPHome.
    :image: description.svg

The ``template`` output component can be used to create templated binary and float outputs in ESPHome.

.. code-block:: yaml

    # Example configuration entry
    output:
      - platform: template
        id: outputsplit
        type: float
        write_action:
          - output.set_level:
              id: output1
              level: !lambda return state;
          - output.set_level:
              id: output2
              level: !lambda return state;

      - platform: ...
        id: output1
      - platform: ...
        id: output2



Configuration variables:
------------------------

- **id** (**Required**, :ref:`config-id`): The id to use for this output component.
- **type** (**Required**, string): The type of output. One of ``binary`` and ``float``.
- **write_action** (**Required**, :ref:`Automation <automation>`): An automation to perform
  when the state of the output is updated.
- All other options from :ref:`Output <config-output>`.

See :apiclass:`output::BinaryOutput` and :apiclass:`output::FloatOutput`.

.. warning::

    This is an **output component** and will not be visible from the frontend. Output components are intermediary
    components that can be attached to for example lights.

.. _output-template-on_write_action:

``write_action`` Trigger
------------------------

When the state for this output is updated, the ``write_action`` is triggered.
It is possible to access the state value inside Lambdas:

.. code-block:: yaml

    - platform: template
        id: my_output
        type: float
        write_action:
          - if:
              condition:
                lambda: return ((state > 0) && (state < .4));
              then:
                - output.turn_on: button_off
                - delay: 500ms
                - output.turn_off: button_off


Complete example: `Sonoff Dual Light Switch <https://devices.esphome.io/devices/Sonoff-Dual-DIY-light>`__.

See Also
--------

- :doc:`/components/output/index`
- :ref:`automation`
- :ghedit:`Edit`
