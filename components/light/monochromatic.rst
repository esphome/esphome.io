Monochromatic Light
===================

.. seo::
    :description: Instructions for setting up monochromatic (brightness-only) lights.
    :image: brightness-medium.svg

The ``monochromatic`` light platform creates a simple brightness-only light from an
:ref:`float output component <output>`.

.. figure:: images/monochromatic-strip.jpg
    :align: center
    :width: 75.0%

    Example of a brightness-only LED strip that can be used with this component.

.. figure:: images/kitchen-lights.png
    :align: center
    :width: 40.0%

.. code-block:: yaml

    # Example configuration entry
    light:
      - platform: monochromatic
        name: "Kitchen Lights"
        output: output_component1


Configuration variables:
------------------------

- **output** (**Required**, :ref:`config-id`): The id of the float :ref:`output` to use for this light.
- All other options from :ref:`Light <config-light>`.

See Also
--------

.. figure:: images/monochromatic-detail.jpg
    :align: center
    :width: 75.0%

- :doc:`/components/output/index`
- :doc:`/components/light/index`
- :doc:`/components/light/binary`
- :doc:`/components/power_supply`
- :doc:`/components/output/ledc`
- :doc:`/components/output/esp8266_pwm`
- :doc:`/components/output/pca9685`
- :doc:`/components/output/tlc59208f`
- :doc:`/components/output/my9231`
- :apiref:`monochromatic/monochromatic_light_output.h`
- :ghedit:`Edit`
