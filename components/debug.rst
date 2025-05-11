Debug Component
===============

.. seo::
    :description: Instructions for setting up the debug component in ESPHome
    :image: bug-report.svg

The ``debug`` component can be used to debug problems with ESPHome. At startup, it prints
a bunch of useful information like reset reason, free heap size, ESPHome version and so on.
It also allows you to get the same information as a text sensor, and to monitor the state of the
ESP heap memory (free space, maximum free block size and fragmentation level) and the main-loop timing.

.. figure:: images/debug.png
    :align: center

    Example debug component output.

.. code-block:: yaml

    # Example configuration entry
    debug:
      update_interval: 5s

    text_sensor:
      - platform: debug
        device:
          name: "Device Info"
        reset_reason:
          name: "Reset Reason"

    sensor:
      - platform: debug
        free:
          name: "Heap Free"
        fragmentation:
          name: "Heap Fragmentation"
        block:
          name: "Heap Max Block"
        loop_time:
          name: "Loop Time"
        psram:
          name: "Free PSRAM"
        cpu_frequency:
          name: "CPU Frequency"

    # Logger must be at least debug (default)
    logger:
      level: debug

Text Sensor
------------
Configuration variables:

- **device** (*Optional*): Reports the following device information:

  - ESPHome Version
  - Free heap size at startup
  - Flash chip size, speed and mode
  - ESP32:

    - Chip model, cores, revision
    - Chip features (BLE / BT / WiFi_BGN / EMB_FLASH / EMB_PSRAM / ...)
    - ESP-IDF version
    - EFuse MAC
    - Reset reason
    - Wakeup reason
  - ESP8266:

    - Chip id, frequency
    - Flash id
    - SDK, Core & Boot versions
    - Reset reason & information

  Accepts all options from :ref:`Text Sensor <config-text_sensor>`.

- **reset_reason** (*Optional*): Reports the last reboot reason in a human-readable form. Accepts all options from :ref:`Text Sensor <config-text_sensor>`.

Sensor
-------
Configuration variables:

- **free** (*Optional*): Reports the free heap size in bytes. All options from :ref:`Sensor <config-sensor>`.

- **fragmentation** (*Optional*): Reports the fragmentation metric of the heap 
  (0% is clean, more than ~50% is not harmless). Only available on ESP8266 with Arduino 2.5.2+.
  All options from :ref:`Sensor <config-sensor>`.

- **block** (*Optional*): Reports the largest contiguous free RAM block on the heap in bytes. All options from :ref:`Sensor <config-sensor>`.
  
- **loop_time** (*Optional*): Reports the longest time between successive iterations of the main loop. All options from :ref:`Sensor <config-sensor>`.

- **psram** (*Optional*): Reports the free PSRAM in bytes. Only available on ESP32. All options from :ref:`Sensor <config-sensor>`.

- **cpu_frequency** (*Optional*): Reports the CPU frequency in Hz. All options from :ref:`Sensor <config-sensor>`.

See Also
--------

- :ref:`sensor-filters`
- :doc:`logger`
- :apiref:`debug/debug_component.h`
- :ghedit:`Edit`
