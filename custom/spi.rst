Custom SPI Device
=================

.. seo::
    :description: Instructions for setting up Custom C++ SPI devices with ESPHome.
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

Lots of devices communicate using the SPI protocol. If you want to integrate
a device into ESPHome that uses this protocol you can pretty much use almost
all Arduino-based code because the ``SPI`` library is also available in ESPHome.

See the other custom component guides for how to register components and make
them publish values.

Please refer to the SPI library docs for more information.

.. code-block:: cpp

    #include "esphome.h"

    class MyCustomComponent : public Component {
     public:
      void setup() override {
        SPI.pins(SCK_PIN, MISO_PIN, MOSI_PIN, CS_PIN);
        SPI.begin();
      }
      void loop() override {
        SPI.beginTransaction(...)

        SPI.write(0x42);
      }
    };

See Also
--------

- :ghedit:`Edit`
