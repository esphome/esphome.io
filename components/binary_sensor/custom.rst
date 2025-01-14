Custom Binary Sensor
====================

.. seo::
    :description: Instructions for setting up Custom C++ binary sensors with ESPHome.
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

This component can be used to create custom binary sensors in ESPHome using the C++ (Arduino) API.

Please first read :doc:`/components/sensor/custom` guide, the same principles apply here and binary
sensors are very similar to sensors internally.

The example below is an example of a custom binary sensor; this custom sensor is essentially the
same as the gpio binary sensor.

.. code-block:: cpp

    #include "esphome.h"

    class MyCustomBinarySensor : public PollingComponent, public BinarySensor {
     public:
      // constructor
      MyCustomBinarySensor() : PollingComponent(15000) {}

      void setup() override {
        // This will be called by App.setup()
        pinMode(5, INPUT);
      }
      void update() override {
        // This will be called every "update_interval" milliseconds.

        // Publish an OFF state
        bool state = digitalRead(5);
        publish_state(state);
      }
    };

(Store this file in your configuration directory, for example ``my_binary_sensor.h``)

And in YAML:

.. code-block:: yaml

    # Example configuration entry
    esphome:
      includes:
        - my_binary_sensor.h

    binary_sensor:
      - platform: custom
        lambda: |-
          auto my_custom_sensor = new MyCustomBinarySensor();
          App.register_component(my_custom_sensor);
          return {my_custom_sensor};

        binary_sensors:
          name: "My Custom Binary Sensor"

Configuration variables:

- **lambda** (**Required**, :ref:`lambda <config-lambda>`): The lambda to run for instantiating the
  binary sensor(s).
- **binary_sensors** (**Required**, list): A list of binary sensors to initialize. The length here
  must equal the number of items in the ``return`` statement of the ``lambda``.

    - All options from :ref:`Binary Sensor <config-binary_sensor>`.

See :apiclass:`BinarySensor <binary_sensor::BinarySensor>`

See Also
--------

- :ghedit:`Edit`
