RP2040 ESPHost
==============

.. seo::
    :description: Instructions for setting up RP2040 ESPHost library.
    :image: rp2040_esphost.svg

Usage
-----

The ``rp2040_esphost`` component allows you to use an ESP32 device running the
`esp-hosted firmware <https://github.com/espressif/esp-hosted>`__ to have a Wi-Fi connection on the Raspberry Pi
Pico - board ``rpipico``, not ``rpipicow``. It uses the ESPHost library, built into the Arduino-Pico core.

The ESP32 is connected to the RP2040 using an SPI bus and 3 additional GPIOs (Handshake, Data Ready, Reset).

Follow the
`esp-hosted SPI setup guide <https://github.com/espressif/esp-hosted/blob/master/esp_hosted_fg/docs/MCU_based_host/SPI_setup.md>`__
to connect the Pi Pico to the ESP32. **Only hardware SPI is supported** on the ESPHome side, so make sure you either use
SPI0 or SPI1 - refer to `pico.pinout.xyz <https://pico.pinout.xyz/>`__ (or the table below) to find which GPIOs you can use.

.. csv-table:: Supported GPIOs (summarized)
    :header: "Function", "RP2040 (SPI0)", "RP2040 (SPI1)", "ESP32", "ESP32-S2/S3", "ESP32-C2/C3/C6"

    "CLK", "GP2/GP6/GP18", "GP10/GP14/GP26", "IO18", "IO12", "IO6"
    "MOSI", "GP3/GP7/GP19", "GP11/GP15/GP27", "IO23", "IO11", "IO7"
    "MISO", "GP0/GP4/GP16/GP20", "GP8/GP12/GP28", "IO19", "IO13", "IO2"
    "CS", "(any)", "(any)", "IO5", "IO10", "IO10"
    "Handshake", "(any)", "(any)", "IO2", "IO2", "IO3"
    "Data Ready", "(any)", "(any)", "IO4", "IO4", "IO4"
    "Reset", "(any)", "(any)", "EN", "RST", "RST"


.. code-block:: yaml

    # Example configuration entry
    spi:
      clk_pin: GPIO10
      mosi_pin: GPIO11
      miso_pin: GPIO12

    rp2040_esphost:
      cs_pin: GPIO13
      handshake_pin: GPIO14
      data_ready_pin: GPIO15
      reset_pin: GPIO16

Make sure to upload the ``ESP-Hosted-FG`` firmware to the ESP32 device. Prebuilt binaries can be found on the
`Releases page <https://github.com/espressif/esp-hosted/releases/tag/release%2Ffg-v0.0.5>`__, however it's
recommended to build the newer version (v0.0.6) manually, using the
`Building setup guide <https://github.com/espressif/esp-hosted/blob/master/esp_hosted_fg/esp/esp_driver/setup_windows11.md>`__.
The guide is written for Windows, but similar steps also apply for building on Linux.

.. note::

    Due to the way Arduino-Pico doesn't use FreeRTOS and threading for the TCP/IP stack, the code might be blocking the
    main loop for a long time, depending on Wi-Fi congestion.

    For reliable operation (without random reboots), it's recommended to disable the RP2040 watchdog:

    .. code-block:: yaml

      # Main RP2040 platform component
      rp2040:
        board: ...
        watchdog_timeout: 0s

    Disabling it is currently the only option, since the watchdog doesn't allow setting timeouts longer than about
    8 seconds.


Configuration variables:
************************

- **spi_id** (*Optional*, :ref:`config-id`): Manually specify the ID of the :ref:`SPI Component <spi>` if you want
  to use multiple SPI buses.
- **cs_pin** (*Required*, :ref:`Pin Schema <config-pin_schema>`): The CS pin.
- **handshake_pin** (*Required*, :ref:`Pin Schema <config-pin_schema>`): The Handshake pin.
- **data_ready_pin** (*Required*, :ref:`Pin Schema <config-pin_schema>`): The Data Ready pin.
- **reset_pin** (*Required*, :ref:`Pin Schema <config-pin_schema>`): The Reset pin.
- **data_rate** (*Optional*): Set the data rate of the SPI interface to the ESP32. One of ``10MHz``, ``5MHz``,
  ``2MHz``, ``1MHz`` (default).

See Also
--------

- :doc:`rp2040`
- :doc:`spi`
- `esp-hosted firmware <https://github.com/espressif/esp-hosted>`__ by Espressif
- :ghedit:`Edit`
