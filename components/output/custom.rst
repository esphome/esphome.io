Custom Output
=============

.. seo::
    :description: Instructions for setting up Custom C++ outputs with ESPHome.
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

This component can be used to create custom binary and float :doc:`outputs </components/output/index>`
in ESPHome using the C++ (Arduino) API.

Please first read :doc:`/components/sensor/custom` guide, the same principles apply here.

The example below is an example of a custom float output; this custom output is essentially the
same as the :doc:`ESP8266 software PWM output </components/output/esp8266_pwm>`.

.. code-block:: cpp

    #include "esphome.h"
    using namespace esphome;

    class MyCustomFloatOutput : public Component, public FloatOutput {
     public:
      void setup() override {
        // This will be called by App.setup()
        pinMode(5, OUTPUT);
      }

      void write_state(float state) override {
        // state is the amount this output should be on, from 0.0 to 1.0
        // we need to convert it to an integer first
        int value = state * 1024;
        analogWrite(5, value);
      }
    };

    // Custom binary output, for exposing binary states
    class MyCustomBinaryOutput : public Component, public BinaryOutput {
     public:
      void setup() override {
        // This will be called by App.setup()
        pinMode(5, OUTPUT);
      }

      void write_state(bool state) override {
        digitalWrite(5, state);
      }
    };

(Store this file in your configuration directory, for example ``my_output.h``)

And in YAML:

.. code-block:: yaml

    # Example configuration entry
    esphome:
      includes:
        - my_output.h

    output:
    - platform: custom
      type: float
      lambda: |-
        auto my_custom_float_output = new MyCustomFloatOutput();
        App.register_component(my_custom_float_output);
        return {my_custom_float_output};

      outputs:
        id: custom_float

    - platform: custom
      type: binary
      lambda: |-
        auto my_custom_binary_output = new MyCustomBinaryOutput();
        App.register_component(my_custom_binary_output);
        return {my_custom_binary_output};

      outputs:
        id: custom_binary

Configuration variables:

- **type** (**Required**, string): The type of output. One of ``binary`` and ``float``.
- **lambda** (**Required**, :ref:`lambda <config-lambda>`): The lambda to run for instantiating the
  output(s).
- **outputs** (**Required**, list): A list of outputs to initialize. The length here
  must equal the number of items in the ``return`` statement of the ``lambda``.

    - All options from :ref:`Output <config-output>`.

See :apiclass:`output::BinaryOutput` and :apiclass:`output::FloatOutput`.

See Also
--------

- :ghedit:`Edit`
