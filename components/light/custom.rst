Custom Light Output
===================

.. seo::
    :description: Instructions for setting up Custom C++ lights with ESPHome.
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

This component can be used to create custom lights in ESPHome using the C++ (Arduino) API.

Please first read :doc:`/components/sensor/custom` guide, the same principles apply here.

All internal stuff (like effects, transitions etc) is handled by the light core
and cannot be overridden. Light outputs are only responsible for displaying some state
when asked to do so.

The example below is an example of a custom light output.

.. code-block:: cpp

    #include "esphome.h"

    class MyCustomLightOutput : public Component, public LightOutput {
     public:
      void setup() override {
        // This will be called by App.setup()
        pinMode(5, INPUT);
      }
      LightTraits get_traits() override {
        // return the traits this light supports
        auto traits = LightTraits();
        traits.set_supported_color_modes({ColorMode::RGB, ColorMode::BRIGHTNESS});
        return traits;
      }

      void write_state(LightState *state) override {
        // This will be called by the light to get a new state to be written.
        float red, green, blue;
        // use any of the provided current_values methods
        state->current_values_as_rgb(&red, &green, &blue);
        // Write red, green and blue to HW
        // ...
      }
    };

(Store this file in your configuration directory, for example ``my_light.h``)

And in YAML:

.. code-block:: yaml

    # Example configuration entry
    esphome:
      includes:
        - my_light.h

    light:
    - platform: custom
      lambda: |-
        auto light_out = new MyCustomLightOutput();
        App.register_component(light_out);
        return {light_out};

      lights:
        - name: "My Custom Light"

Configuration variables:

- **lambda** (**Required**, :ref:`lambda <config-lambda>`): The lambda to run for instantiating the
  light output(s).
- **lights** (**Required**, list): A list of lights to initialize. The length here
  must equal the number of items in the ``return`` statement of the ``lambda``.

  - All options from :ref:`Light <config-light>`.

See :apiclass:`Light <light::LightOutput>`

See Also
--------

- :ghedit:`Edit`
