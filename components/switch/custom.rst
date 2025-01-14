Custom Switch
=============

.. seo::
    :description: Instructions for setting up Custom C++ switches with ESPHome.
    :image: language-cpp.svg
    :keywords: C++, Custom

.. warning::

    :ref:`Custom Components are deprecated<a_note_about_custom_components>`, not recommended for new configurations and
    will be removed from ESPHome in the ``2025.1.0`` release. Please look at creating a real ESPHome component and
    "importing" it into your configuration with :doc:`/components/external_components`.

    You can find some basic documentation on creating your own components at :ref:`contributing_to_esphome`.

.. warning::

    While we try to keep the ESPHome YAML configuration options as stable as possible, the ESPHome API is less
    stable. If something in the APIs needs to be changed in order for something else to work, we will do so.

This component can be used to create custom switches in ESPHome using the C++ (Arduino) API.

Please first read :doc:`/components/sensor/custom` guide, the same principles apply here.

The example below is an example of a custom switch; this custom switch is essentially the
same as the gpio switch implementation.

.. code-block:: cpp

    #include "esphome.h"

    class MyCustomSwitch : public Component, public Switch {
     public:
      void setup() override {
        // This will be called by App.setup()
        pinMode(5, INPUT);
      }
      void write_state(bool state) override {
        // This will be called every time the user requests a state change.

        digitalWrite(5, state);

        // Acknowledge new state by publishing it
        publish_state(state);
      }
    };

(Store this file in your configuration directory, for example ``my_switch.h``)

And in YAML:

.. code-block:: yaml

    # Example configuration entry
    esphome:
      includes:
        - my_switch.h

    switch:
    - platform: custom
      lambda: |-
        auto my_custom_switch = new MyCustomSwitch();
        App.register_component(my_custom_switch);
        return {my_custom_switch};

      switches:
        name: "My Custom Switches"
        id: my_custom_switch

Configuration variables:

- **lambda** (**Required**, :ref:`lambda <config-lambda>`): The lambda to run for instantiating the
  switch(es).
- **switches** (**Required**, list): A list of switches to initialize. The length here
  must equal the number of items in the ``return`` statement of the ``lambda``.

  - All options from :ref:`Switch <config-switch>`.

See :apiclass:`Switch <switch_::Switch>`

See Also
--------

- :ghedit:`Edit`
