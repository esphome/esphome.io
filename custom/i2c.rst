Custom I²C Device
=================

.. seo::
    :description: Instructions for setting up Custom C++ I2C devices with ESPHome.
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

Lots of devices communicate using the I²C protocol. If you want to integrate
a device into ESPHome that uses this protocol you can pretty much use almost
all Arduino-based code because the ``Wire`` library is also available in ESPHome.

See the other custom component guides for how to register components and make
them publish values.

.. code-block:: cpp

    #include "esphome.h"

    class MyCustomComponent : public Component {
     public:
      void setup() override {
        // Initialize the device here. Usually Wire.begin() will be called in here,
        // though that call is unnecessary if you have an 'i2c:' entry in your config

        Wire.begin();
      }
      void loop() override {
        // Example: write the value 0x42 to register 0x78 of device with address 0x21
        Wire.beginTransmission(0x21);
        Wire.write(0x78);
        Wire.write(0x42);
        Wire.endTransmission();
      }
    };


I²C Write
---------
It may be useful to write to a register via I²C using a numerical input. For example, the following yaml code snippet captures a user-supplied numerical input in the range 1--255 from the dashboard:

.. code-block:: yaml

    number:
        - platform: template
        name: "Input 1"
        optimistic: true
        min_value: 1
        max_value: 255
        initial_value: 20
        step: 1
        mode: box
        id: input_1
        icon: "mdi:counter"

We want to write this number to a ``REGISTER_ADDRESS`` on the slave device via I²C. The Arduino-based looping code shown above is modified following the guidance in :doc:`Custom Sensor Component </components/sensor/custom>`.

.. code-block:: cpp

    #include "esphome.h"

    const uint16_t I2C_ADDRESS = 0x21;
    const uint16_t REGISTER_ADDRESS = 0x78;
    const uint16_t POLLING_PERIOD = 15000; //milliseconds
    char temp = 20; //Initial value of the register

    class MyCustomComponent : public PollingComponent {
     public:
      MyCustomComponent() : PollingComponent(POLLING_PERIOD) {}
      float get_setup_priority() const override { return esphome::setup_priority::BUS; } //Access I2C bus

      void setup() override {
        //Add code here as needed
        Wire.begin();
        }

      void update() override {
      char register_value = id(input_1).state; //Read the number set on the dashboard
      //Did the user change the input?
      if(register_value != temp){
            Wire.beginTransmission(I2C_ADDRESS);
            Wire.write(REGISTER_ADDRESS);
            Wire.write(register_value);
            Wire.endTransmission();
            temp = register_value; //Swap in the new value
            }
        }
    };

The ``Component`` class has been replaced with ``PollingComponent`` and the free-running ``loop()`` is changed to the  ``update()`` method with period set by ``POLLING_PERIOD``. The numerical value from the dashboard is accessed with its ``id`` tag and its state is set to the byte variable that we call ``register_value``.  To prevent an I²C write on every iteration, the contents of the register are stored in ``temp`` and checked for a change. Configuring the hardware with ``get_setup_priority()`` is explained in :doc:`Step 1 </components/sensor/custom>`.




See Also
--------

- :ghedit:`Edit`
