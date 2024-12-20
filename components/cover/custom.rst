Custom Cover
============

.. seo::
    :description: Instructions for setting up Custom C++ covers with ESPHome.
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

This component can be used to create custom covers in ESPHome using the C++ (Arduino) API.

Please first read :doc:`/components/sensor/custom` guide, the same principles apply here.

The example below is an example of a custom cover - all covers must override two methods:

- ``get_traits``: This should return a :apiclass:`CoverTraits <cover::CoverTraits>` object
  representing the capabilities of the cover.
- ``control``: This receives a :apiclass:`CoverCall <cover::CoverCall>` object that contains
  the command the user tried to set.

.. code-block:: cpp

    #include "esphome.h"

    class MyCustomCover : public Component, public Cover {
     public:
      void setup() override {
        // This will be called by App.setup()
        pinMode(5, INPUT);
      }
      CoverTraits get_traits() override {
        auto traits = CoverTraits();
        traits.set_is_assumed_state(false);
        traits.set_supports_position(true);
        traits.set_supports_tilt(false);
        traits.set_supports_stop(true);
        return traits;
      }
      void control(const CoverCall &call) override {
        // This will be called every time the user requests a state change.
        if (call.get_position().has_value()) {
          float pos = *call.get_position();
          // Write pos (range 0-1) to cover
          // ...

          // Publish new state
          this->position = pos;
          this->publish_state();
        }
        if (call.get_stop()) {
          // User requested cover stop
        }
      }
    };

(Store this file in your configuration directory, for example ``my_cover.h``)

And in YAML:

.. code-block:: yaml

    # Example configuration entry
    esphome:
      includes:
        - my_cover.h

    cover:
    - platform: custom
      lambda: |-
        auto my_custom_cover = new MyCustomCover();
        App.register_component(my_custom_cover);
        return {my_custom_cover};

      covers:
        - name: "My Custom Cover"

Configuration variables:

- **lambda** (**Required**, :ref:`lambda <config-lambda>`): The lambda to run for instantiating the
  cover(s).
- **covers** (**Required**, list): A list of covers to initialize. The length here
  must equal the number of items in the ``return`` statement of the ``lambda``.

  - All options from :ref:`Cover <config-cover>`.

See :apiclass:`Cover <cover::Cover>`

See Also
--------

- :ghedit:`Edit`
