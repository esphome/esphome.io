ESP32 Platform
==============

.. seo::
    :description: Configuration for the ESP32 platform for ESPHome.
    :image: esp32.svg

This component contains platform-specific options for the ESP32 platform.

.. code-block:: yaml

    # Example configuration entry
    esp32:
      board: esp32dev

Configuration variables:
------------------------

- **board** (**Required**, string): The PlatformIO board ID that should be used. Choose the appropriate board from
  `this list <https://registry.platformio.org/platforms/platformio/espressif32/boards?version=5.3.0>`__ (the icon next
  to the name can be used to copy the board ID). *This only affects pin aliases, flash size and some internal settings*;
  if unsure or you cannot find your exact board, using a generic board (from Espressif) such as ``esp32dev`` almost
  always works just fine.
- **flash_size** (*Optional*, string): The amount of flash memory available on the ESP32 board/module. One of ``2MB``,
  ``4MB``, ``8MB``, ``16MB`` or ``32MB``. Defaults to ``4MB``. **Warning: specifying a size larger than that available
  on your board will cause the ESP32 to fail to boot.**
- **partitions** (*Optional*, filename): The name of (optionally including the path to) the file containing the
  partitioning scheme to be used. When not specified, partitions are automatically generated based on ``flash_size``.
- **variant** (*Optional*, string): The variant of the ESP32 that is used on this board. One of ``esp32``,
  ``esp32s2``, ``esp32s3``, ``esp32c3`` and ``esp32h2``. Defaults to the variant that is detected from the board; if
  a board that's unknown to ESPHome is used, this option is mandatory.
- **framework** (*Optional*): Options for the underlying framework used by ESPHome. See :ref:`esp32-arduino_framework`
  and :ref:`esp32-espidf_framework`.

.. _esp32-arduino_framework:

Arduino framework
-----------------

This is the default framework for ESP32 chips at the moment.

.. code-block:: yaml

    # Example configuration entry
    esp32:
      board: ...
      framework:
        type: arduino

Configuration variables:
************************

- **version** (*Optional*, string): The base framework version number to use, from
  `ESP32 arduino releases <https://github.com/espressif/arduino-esp32/releases>`__. Defaults to ``recommended``.
  Additional values are:

  - ``dev``: Use the latest commit from https://github.com/espressif/arduino-esp32, note this may break at any time
  - ``latest``: Use the latest *release* from https://github.com/espressif/arduino-esp32/releases, even if it hasn't
    been recommended yet.
  - ``recommended``: Use the recommended framework version.

- **source** (*Optional*, string): The PlatformIO package or repository to use for framework. This can be used to use a
  custom or patched version of the framework.
- **platform_version** (*Optional*, string): The version of the
  `platformio/espressif32 <https://github.com/platformio/platform-espressif32/releases/>`__ package to use.
- **advanced** (*Optional*, mapping): See :ref:`esp32-advanced_configuration` below.

.. _esp32-espidf_framework:

ESP-IDF framework
-----------------

This is an alternative base framework for ESP32 chips; it is recommended for variants of the ESP32 like ESP32S2,
ESP32S3, ESP32C3 and single-core ESP32 chips.

.. code-block:: yaml

    # Example configuration entry
    esp32:
      board: ...
      framework:
        type: esp-idf

Configuration variables:
************************

- **version** (*Optional*, string): The base framework version number to use, from
  `ESP32 ESP-IDF releases <https://github.com/espressif/esp-idf/releases>`__. Defaults to ``recommended``.
  Additional values are:

  - ``dev``: Use the latest commit from https://github.com/espressif/esp-idf, note this may break at any time
  - ``latest``: Use the latest *release* from https://github.com/espressif/esp-idf/releases, even if it hasn't been
    recommended yet.
  - ``recommended``: Use the recommended framework version.

- **source** (*Optional*, string): The PlatformIO package or repository to use for the framework. This can be used to
  use a custom or patched version of the framework.
- **platform_version** (*Optional*, string): The version of the
  `platformio/espressif32 <https://github.com/platformio/platform-espressif32/releases/>`__ package to use.
- **sdkconfig_options** (*Optional*, mapping): Custom sdkconfig
  `compiler options <https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/kconfig.html#compiler-options>`__
  to set in the ESP-IDF project.
- **advanced** (*Optional*, mapping): See :ref:`esp32-advanced_configuration` below.

.. _esp32-advanced_configuration:

Advanced Configuration
----------------------

- **ignore_efuse_custom_mac** (*Optional*, boolean): Can be set to ``true`` for devices on which the burned-in custom
  MAC address is not valid.
- **ignore_efuse_mac_crc** (*Optional*, boolean): Can be set to ``true`` for devices on which the burned-in MAC
  address is not consistent with the burned-in CRC for that MAC address, resulting in an error like
  ``Base MAC address from BLK0 of EFUSE CRC error``. **Valid only on original ESP32 with** ``esp-idf`` **framework.**

GPIO Pin Numbering
------------------

The ESP32 boards often use the internal GPIO pin numbering based on the microcontroller, so you likely don't have to
worry about pin alias names or numbering...yay!

Some notes about the pins on the original ESP32:

- ``GPIO0`` is used to determine the boot mode on startup; note that **ESP32 variants use different pins to determine
  the boot mode.** Bootstrapping pin(s) should **not** be pulled LOW on startup to avoid booting into flash mode when
  it's not desired. You can, however, still use the strapping pins as output pins.
- ``GPIO34`` to ``GPIO39``: These pins **cannot** be used as outputs (yes, even though GPIO stands for "general purpose
  input/**output**"...).
- ``GPIO32`` to ``GPIO39``: These pins can be used with the :doc:`/components/sensor/adc` to measure voltages.
- ``GPIO2``: On the ``esp32dev`` board, this pin is connected to the blue LED. It also supports the
  :doc:`touch pad binary sensor </components/binary_sensor/esp32_touch>` (in addition to a few other pins).

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: gpio
        name: "Pin GPIO23"
        pin: GPIO23

See Also
--------

- :doc:`esphome`
- :ghedit:`Edit`
