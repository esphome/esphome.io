Custom Text Sensor
==================

.. seo::
    :description: Instructions for setting up Custom C++ text sensors with ESPHome.
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

This component can be used to create custom text sensors in ESPHome using the C++ (Arduino) API.

Please first read :doc:`/components/sensor/custom` guide, the same principles apply here and text
sensors are very similar to sensors internally.

The example below is an example of a custom text sensor which constantly publishes
the message "Hello World!".

.. code-block:: cpp

    #include "esphome.h"

    class MyCustomTextSensor : public PollingComponent, public TextSensor {
     public:
      // constructor
      MyCustomTextSensor() : PollingComponent(15000) {}

      void setup() override {
        // This will be called by App.setup()
      }
      void update() override {
        // This will be called every "update_interval" milliseconds.
        // Publish state
        publish_state("Hello World!");
      }
    };

(Store this file in your configuration directory, for example ``my_text_sensor.h``)

And in YAML:

.. code-block:: yaml

    # Example configuration entry
    esphome:
      includes:
        - my_text_sensor.h

    text_sensor:
    - platform: custom
      lambda: |-
        auto my_custom_sensor = new MyCustomTextSensor();
        App.register_component(my_custom_sensor);
        return {my_custom_sensor};

      text_sensors:
        name: "My Custom Text Sensor"

Configuration variables:

- **lambda** (**Required**, :ref:`lambda <config-lambda>`): The lambda to run for instantiating the
  text sensor(s).
- **text_sensors** (**Required**, list): A list of text sensors to initialize. The length here
  must equal the number of items in the ``return`` statement of the ``lambda``.

    - All options from :ref:`Text Sensor <config-text_sensor>`.

See Also
--------

- :doc:`/components/text_sensor/index`
- :apiclass:`API Reference <text_sensor::TextSensor>`
- :ghedit:`Edit`
