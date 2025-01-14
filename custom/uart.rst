Custom UART Device
==================

.. seo::
    :description: Instructions for setting up Custom C++ UART devices with ESPHome.
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

Lots of devices communicate using the UART protocol. If you want to integrate
a device into ESPHome that uses this protocol you can pretty much use almost
all Arduino-based code because ESPHome has a nice abstraction over the UART bus.

See the other custom component guides for how to register components and make
them publish values.

.. code-block:: cpp

    #include "esphome.h"

    class MyCustomComponent : public Component, public UARTDevice {
     public:
      MyCustomComponent(UARTComponent *parent) : UARTDevice(parent) {}

      void setup() override {
        // nothing to do here
      }
      void loop() override {
        // Use Arduino API to read data, for example
        String line = readString();
        int i = parseInt();
        while (available()) {
          char c = read();
        }
        // etc
      }
    };

And in YAML:

.. code-block:: yaml

    # Example configuration entry
    esphome:
      includes:
        - my_custom_component.h

    uart:
      id: uart_bus
      tx_pin: GPIOXX
      rx_pin: GPIOXX
      baud_rate: 9600

    custom_component:
    - lambda: |-
        auto my_custom = new MyCustomComponent(id(uart_bus));
        return {my_custom};

See Also
--------

- :ghedit:`Edit`
