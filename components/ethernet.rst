Ethernet Component
==================

.. seo::
    :description: Instructions for setting up the Ethernet configuration for your ESP32 node in ESPHome.
    :image: ethernet.svg
    :keywords: Ethernet, ESP32

This ESPHome component enables *wired* Ethernet connections for ESP32s.

Ethernet for ESP8266 is not supported.

This component and the Wi-Fi component may **not** be used simultaneously, even if both are physically available.

.. code-block:: yaml

    # Example configuration entry for RMII chips
    ethernet:
      type: LAN8720
      mdc_pin: GPIOXX
      mdio_pin: GPIOXX
      clk_mode: GPIO0_IN
      phy_addr: 0

      # Optional manual IP
      manual_ip:
        static_ip: 10.0.0.42
        gateway: 10.0.0.1
        subnet: 255.255.255.0

.. code-block:: yaml

    # Example configuration entry for SPI chips
    ethernet:
      type: W5500
      clk_pin: GPIOXX
      mosi_pin: GPIOXX
      miso_pin: GPIOXX
      cs_pin: GPIOXX
      interrupt_pin: GPIOXX
      reset_pin: GPIOXX

Configuration variables:
------------------------

- **type** (**Required**, string): The type of LAN chipset/phy.

  Supported chipsets are:

  - ``LAN8720`` (RMII)
  - ``RTL8201`` (RMII)
  - ``DP83848`` (RMII)
  - ``IP101`` (RMII)
  - ``JL1101`` (RMII)
  - ``KSZ8081`` (RMII)
  - ``KSZ8081RNA`` (RMII)
  - ``W5500`` (SPI)
  - ``OPENETH`` (QEMU, ESP-IDF only)

RMII configuration variables:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- **mdc_pin** (**Required**, :ref:`config-pin`): The MDC pin of the board.
  Usually this is ``GPIO23``.
- **mdio_pin** (**Required**, :ref:`config-pin`): The MDIO pin of the board.
  Usually this is ``GPIO18``.
- **clk_mode** (*Optional*, string): The clock mode of the data lines. See your board's
  datasheet for more details. Must be one of the following values:

  - ``GPIO0_IN`` (Default) - External clock
  - ``GPIO0_OUT`` - Internal clock
  - ``GPIO16_OUT`` - Internal clock
  - ``GPIO17_OUT`` - Internal clock

- **phy_addr** (*Optional*, int): The PHY addr type of the Ethernet controller. Defaults to 0.
- **phy_registers** (*Optional*, mapping): Arbitrary PHY register values to set after Ethernet initialization.

  - **address** (**Required**, hex): The register address as a hex number (e.g. ``0x10`` for address 16)
  - **value** (**Required**, hex): The value of the register to set as a hex number (e.g. ``0x1FFA``)
  - **page_id** (*Optional*, hex): (RTL8201 only) Register page number to select before writing (e.g. ``0x07`` for page 7)

- **power_pin** (*Optional*, :ref:`Pin Schema <config-pin_schema>`): The pin controlling the
  power/reset status of the Ethernet controller. Leave unspecified for no power pin (default).

SPI configuration variables:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- **clk_pin** (**Required**, :ref:`config-pin`): The SPI clock pin.
- **mosi_pin** (**Required**, :ref:`config-pin`): The SPI MOSI pin.
- **miso_pin** (**Required**, :ref:`config-pin`): The SPI MISO pin.
- **cs_pin** (**Required**, :ref:`config-pin`): The SPI chip select pin.
- **interrupt_pin** (*Optional*, :ref:`config-pin`): The interrupt pin.
  This variable is **required** for older frameworks. See below.
- **reset_pin** (*Optional*, :ref:`config-pin`): The reset pin.
- **clock_speed** (*Optional*, float): The SPI clock speed.
  Any frequency between `8Mhz` and `80Mhz` is allowed, but the nearest integer division
  of `80Mhz` is used, i.e. `16Mhz` (`80Mhz` / 5) is used when `15Mhz` is configured.
  Default: `26.67Mhz`.
- **polling_interval** (*Optional*, :ref:`config-time`): If ``interrupt_pin`` is not set,
  set the time interval for periodic polling. Minimum is 1ms, Defaults to 10ms.
  Older frameworks may not support this variable. See below for details.

If you are using a framework with the latest version, ESPHome provides
an SPI-based Ethernet module without interrupt pin.
Support for SPI polling mode (no interrupt pin) is provided by the following frameworks:

- ESP-IDF 5.3 or later
- ESP-IDF 5.2.1 and later 5.2.x versions
- ESP-IDF 5.1.4
- Arduino-ESP32 3.0.0 or later (**Caution**: PlatformIO does not support these Arduino-ESP32 versions)

When building with frameworks that support SPI polling mode, either ``interrupt_pin``
or ``polling_interval`` can be set. If you set both, ESPHome will throw an error.

If you are using a framework that does not support SPI-based ethernet modules without interrupt pin,
``interrupt_pin`` is **required** and you cannot set ``polling_interval``.

Advanced common configuration variables:
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

- **manual_ip** (*Optional*): Manually configure the static IP of the node.

  - **static_ip** (**Required**, IPv4 address): The static IP of your node.
  - **gateway** (**Required**, IPv4 address): The gateway of the local network.
  - **subnet** (**Required**, IPv4 address): The subnet of the local network.
  - **dns1** (*Optional*, IPv4 address): The main DNS server to use.
  - **dns2** (*Optional*, IPv4 address): The backup DNS server to use.

- **use_address** (*Optional*, string): Manually override what address to use to connect
  to the ESP. Defaults to auto-generated value. For example, if you have changed your
  static IP and want to flash OTA to the previously configured IP address.
- **domain** (*Optional*, string): Set the domain of the node hostname used for uploading.
  For example, if it's set to ``.local``, all uploads will be sent to ``<HOSTNAME>.local``.
  Defaults to ``.local``.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.


.. note::

    If your Ethernet board is not designed with an ESP32 built in, it's common to attempt
    to use flying leads, dupont wires, etc. to connect the Ethernet controller to the ESP32.
    This approach is likely to fail, however, as the Ethernet interface uses a high frequency
    clock signal that will not travel reliably over these types of connections. For more
    information and wiring details refer to the link in the *See also* section.

.. note::

    SPI based chips do *not* use :doc:`spi`. This means that SPI pins can't be shared with other devices.

Configuration examples
----------------------

**Olimex ESP32-POE**:

.. code-block:: yaml

    ethernet:
      type: LAN8720
      mdc_pin: GPIO23
      mdio_pin: GPIO18
      clk_mode: GPIO17_OUT
      phy_addr: 0
      power_pin: GPIO12

.. note::

    WROVER version of Olimex POE cards change CLK to ping GPIO0, configuration must be `clk_mode: GPIO0_OUT`.


**Olimex ESP32-EVB**:

.. code-block:: yaml

    ethernet:
      type: LAN8720
      mdc_pin: GPIO23
      mdio_pin: GPIO18
      clk_mode: GPIO0_IN
      phy_addr: 0

**Olimex ESP32-GATEWAY** and **LILYGO TTGO T-Internet-POE ESP32-WROOM LAN8270A**:

.. code-block:: yaml

    ethernet:
      type: LAN8720
      mdc_pin: GPIO23
      mdio_pin: GPIO18
      clk_mode: GPIO17_OUT
      phy_addr: 0

**LILYGO TTGO T-Internet ESP32-WROVER-E LAN8270**:

.. code-block:: yaml

    ethernet:
      type: LAN8720
      mdc_pin: GPIO23
      mdio_pin: GPIO18
      clk_mode: GPIO0_OUT
      phy_addr: 0
      power_pin: GPIO04

**Wireless Tag WT32-ETH01** and **SMLIGHT SLZB-06 PoE Zigbee**:

.. code-block:: yaml

    ethernet:
      type: LAN8720
      mdc_pin: GPIO23
      mdio_pin: GPIO18
      clk_mode: GPIO0_IN
      phy_addr: 1
      power_pin: GPIO16

**M5Stack PoESP32** and **ESP32-Ethernet-Kit**:

.. code-block:: yaml

    ethernet:
      type: IP101
      mdc_pin: GPIO23
      mdio_pin: GPIO18
      clk_mode: GPIO0_IN
      phy_addr: 1
      power_pin: GPIO5

**AiThinker ESP32-G Gateway**:

.. code-block:: yaml

    ethernet:
      type: LAN8720
      mdc_pin: GPIO23
      mdio_pin: GPIO18
      clk_mode: GPIO17_OUT
      phy_addr: 1
      power_pin: GPIO5

**wESP32**:

.. code-block:: yaml

    # for board up to rev.5
    ethernet:
      type: LAN8720
      mdc_pin: GPIO16
      mdio_pin: GPIO17
      clk_mode: GPIO0_IN
      phy_addr: 0

    # for board rev.7 and up
    ethernet:
      type: RTL8201
      mdc_pin: GPIO16
      mdio_pin: GPIO17
      clk_mode: GPIO0_IN
      phy_addr: 0
      phy_registers:
        - address: 0x10
          value: 0x1FFA
          page_id: 0x07


.. note::

    Revision 5 and below of the wESP32 board use the LAN8720 Ethernet PHY. Revision 7 and newer of it use the RTL8201 Ethernet PHY.


**OpenHacks LAN8720**:

.. code-block:: yaml

    ethernet:
      type: LAN8720
      mdc_pin: GPIO23
      mdio_pin: GPIO18
      phy_addr: 1

.. note::

    This board has an issue that might cause the ESP32 to boot in program mode. When testing, make sure
    you are monitoring the serial output and reboot the device several times to see if it boots into the
    program properly.


**Esp32-Stick-Eth** and **Esp32-Stick-PoE-P** and **Esp32-Stick-PoE-A**:

.. code-block:: yaml

    ethernet:
      type: LAN8720
      mdc_pin: GPIO23
      mdio_pin: GPIO18
      clk_mode: GPIO17_OUT
      phy_addr: 1

**LILYGO T-ETH-Lite ESP32**:

.. code-block:: yaml

    ethernet:
      type: RTL8201
      mdc_pin: GPIO23
      mdio_pin: GPIO18
      clk_mode: GPIO0_IN
      phy_addr: 0
      power_pin: GPIO12


**QEMU qemu-system-xtensa**:

.. code-block:: yaml

    ethernet:
      type: OPENETH

See Also
--------

- :doc:`network`
- :doc:`text_sensor/ethernet_info`
- :apiref:`ethernet/ethernet_component.h`
- `ESP32 Ethernet PHY connection info <https://pcbartists.com/design/embedded/esp32-ethernet-phy-schematic-design/>`__
- :ghedit:`Edit`
