.. _spi:

SPI Bus
=======

.. seo::
    :description: Instructions for setting up SPI components in ESPHome
    :image: spi.svg
    :keywords: SPI

SPI is a very common high-speed protocol for a lot of devices. The ESPHome SPI component implements only the host controller
role, where it controls the bus, and writes or reads data from peripherals attached to the bus.

The SPI bus usually consists of 4 wires:

- **CLK**: Is used to tell the receiving device when to read data. All devices on the bus can
  share this line. Sometimes also called ``SCK``.
- **CS** (chip select): Is used to tell the receiving device when it should listen for data. Each device has
  an individual CS line. Sometimes also called ``SS``. If the SPI bus has a single device, its CS pin
  can sometimes be connected to ground to tell it that it is always selected.
- **MOSI** (aka SDO - Serial Data Out): Is used to send data from the controller (the ESP) to the peripheral device.
  All devices on the bus share this line.
- **MISO** (also SDI - Serial Data In): Is used to receive data. All devices on the bus share this line.

In some cases one of **MOSI** or **MISO** does not exist as the receiving device only accepts data or sends data.
It is also possible to configure a quad SPI interface using 4 output data lines. This is required only for
use with certain components.

To set up SPI devices in ESPHome, you first need to place a top-level SPI component which defines the pins to
use for the functions described above. The **CS** pins are individually managed by the other components that
reference the ``spi`` component.
This component also accepts a list of controllers if you want to implement multiple SPI buses.

.. code-block:: yaml

    # Example configuration entry - single controller
    spi:
      clk_pin: GPIOXX
      mosi_pin: GPIOXX
      miso_pin: GPIOXX

    # Example configuration entry - three controllers, one using quad SPI
    spi:
      - id: spi_bus0
        clk_pin: GPIOXX
        mosi_pin: GPIOXX
        miso_pin: GPIOXX
        interface: hardware
      - id: spi_bus1
        clk_pin: GPIOXX
        mosi_pin: GPIOXX
        miso_pin: GPIOXX
        interface: any
      - id: quad_spi_bus
        type: quad
        clk_pin: GPIOXX
        data_pins:
          - GPIOXX
          - GPIOXX
          - GPIOXX
          - GPIOXX

Configuration variables:
------------------------

- **type** (*Optional*): Choose between ``single`` for standard 1 bit bus SPI (the default) or ``quad`` for quad SPI.
- **clk_pin** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The pin used for the clock line of the SPI bus.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID for this SPI hub if you need multiple SPI hubs.
- **interface** (*Optional*): Controls which hardware or software SPI implementation should be used.
  Value may be one of ``any`` (default), ``software``, ``hardware``, ``spi``, ``spi2`` or ``spi3``, depending on
  the type and the particular chip used. See discussion below.

For the conventional ``single`` bit bus at least one of ``miso_pin`` or ``mosi_pin`` is required.

- **mosi_pin** (*Optional*, :ref:`Pin Schema <config-pin_schema>`): The pin used for the MOSI line of the SPI bus.
- **miso_pin** (*Optional*, :ref:`Pin Schema <config-pin_schema>`): The pin used for the MISO line of the SPI bus.

For ``quad`` type instead specify ``data_pins``:

- **data_pins** (*Required*, :ref:`Pin Schema <config-pin_schema>`): Must be a list of exactly 4 pins to be used
  for the quad SPI output data lines.


Interface selection:
--------------------

ESP32 and ESP8266 chips have several hardware SPI controller implementations - usually the first one or two
are reserved for use to access
the flash and PSRAM memories, leaving one or two user-accessible controllers. SPI controller instances configured in
ESPHome can be assigned to one of these with the ``interface:`` configuration option.

By default (``interface: any``) the first available hardware controller will be assigned, a second if available then
any further instances configured will use software mode. You can choose a specific controller with ``spi`` (meaning
the first or only available controller) or one of ``spi2`` and ``spi3`` for ESP32 chips with two available SPI
controllers. Note that SPI0 and SPI1 are typically not available, being reserved for accessing flash and PSRAM.

If the ``software`` option is chosen, or you configure more SPI instances than there are available hardware controllers,
the remaining instances will use a software implementation, which is unable to achieve data rates above a few hundred
kHz. This is acceptable for sensors or other devices not transferring large amounts of data, but will be too slow
to drive a display for example.

While the ESP32 supports the reassignment of the default SPI pins to most other GPIO pins, using the dedicated SPI pins
can improve performance and stability for certain ESP/device combinations.
ESP8266 has a more limited selection of pins that can be used; check the datasheet for more information.

Quad mode requires a hardware interface, so ``software`` and ``any`` are not permitted values.

Generic SPI device component:
-----------------------------
.. _spi_device:

Other components that depend on the SPI component will reference it, typically to communicate with specific
peripheral devices. There is also a general-purpose SPI device component that can be used to communicate with hardware not
supported by a specific component. It allows selection of the SPI mode, data_rate, CS pin and bit order.
Reads and writes on the device can be performed with lambdas. For example:

.. code-block:: yaml

    spi:
        clk_pin: GPIOXX
        mosi_pin: GPIOXX
        miso_pin: GPIOXX
        interface: hardware

    spi_device:
        id: spidev
        cs_pin: GPIOXX
        data_rate: 2MHz
        spi_mode: 3
        bit_order: lsb_first

   on...:
     then:
       - lambda: !lambda |-
           id(spidev).enable();
           id(spidev).write_byte(0x4F);
           id(spidev).disable();


Configuration variables:
------------------------

- **data_rate** (*Optional*): Set the data rate of the controller. One of ``80MHz``, ``40MHz``, ``20MHz``, ``10MHz``,
  ``5MHz``, ``4MHz``, ``2MHz``, ``1MHz`` (default), ``200kHz``, ``75kHz`` or ``1kHz``. A numeric value in Hz can alternatively
  be specified.
- **spi_mode** (*Optional*): Set the controller mode - one of ``mode0``, ``mode1``, ``mode2``, ``mode3``. The default is ``mode3``.
  See table below for more information
- **bit_order** (*Optional*): Set the bit order - choose one of ``msb_first`` (default) or ``lsb_first``.
- **cs_pin** (*Optional*, :ref:`Pin Schema <config-pin_schema>`): The CS pin.

SPI modes:
----------

SPI devices operate in one of four modes as per the table below. The choice of mode is dictated by the requirements
of the speficic peripheral chip.

.. csv-table:: Supported Modes
    :header: "Mode", "Clock Idle Polarity", "Clock Phase", "Data shifted on", "Data sampled on"

    "0", "low", "leading", "/CS activation and falling CLK", "rising CLK"
    "1", "low", "trailing", "rising CLK", "falling CLK"
    "2", "high", "leading", "/CS activation and rising CLK", "falling CLK"
    "3", "high", "trailing", "falling CLK", "rising CLK"



See Also
--------

- :apiref:`spi/spi.h`
- :ghedit:`Edit`
