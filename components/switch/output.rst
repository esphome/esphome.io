Generic Output Switch
=====================

.. seo::
    :description: Instructions for setting up generic output switches in ESPHome that control an output component.
    :image: upload.svg

The ``output`` switch platform allows you to use any output component as a switch.

.. figure:: images/output-ui.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    output:
      - platform: gpio
        pin: GPIOXX
        id: 'generic_out'
    switch:
      - platform: output
        name: "Generic Output"
        output: 'generic_out'

Configuration variables:
------------------------

- **output** (**Required**, :ref:`config-id`): The ID of the output component to use.
- All other options from :ref:`Switch <config-switch>`.

See Also
--------

- :doc:`/components/output/index`
- :apiref:`output/switch/output_switch.h`
- :ghedit:`Edit`
