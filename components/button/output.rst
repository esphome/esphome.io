Generic Output Button
=====================

.. seo::
    :description: Instructions for setting up generic output buttons in ESPHome that control an output component.
    :image: upload.svg

The ``output`` button platform allows you to use any output component as a button. This can for example be used to
momentarily set a GPIO pin using a button.

.. figure:: images/generic-ui.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    output:
      - platform: gpio
        pin: GPIOXX
        id: output1

    button:
      - platform: output
        name: "Generic Output"
        output: output1
        duration: 500ms

Configuration variables:
------------------------

- **output** (**Required**, :ref:`config-id`): The ID of the output component to use.
- **duration** (**Required**, :ref:`config-time`): How long the output should be set when the button is pressed.
- All other options from :ref:`Button <config-button>`.

.. note::

    When used with a :doc:`/components/output/gpio`, the pin will be low by default and pulled high when the button is
    pressed. To invert this behaviour and have the pin pulled low when the button is pressed, set the `inverted` option
    in the :ref:`config-pin_schema`.

See Also
--------

- :doc:`/components/output/index`
- :apiref:`output/button/output_button.h`
- :ghedit:`Edit`
