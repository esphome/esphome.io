Template Button
===============

.. seo::
    :description: Instructions for setting up template buttons that can execute arbitrary actions when pressed.
    :image: description.svg

The ``template`` button platform allows you to create simple buttons out of just actions. Once defined,
it will automatically appear in Home Assistant as a button and can be controlled through the frontend.

.. code-block:: yaml

    # Example configuration entry
    button:
      - platform: template
        name: "Template Button"
        on_press:
          - logger.log: Button Pressed

Configuration variables:
------------------------

- All options from :ref:`Button <config-button>`.

See Also
--------

- :doc:`/automations/index`
- :doc:`/components/button/index`
- :ghedit:`Edit`
