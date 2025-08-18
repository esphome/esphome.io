ESP32 Arduino to ESP-IDF Migration Guide
=========================================

.. seo::
    :description: Guide for migrating ESP32 devices from Arduino framework to ESP-IDF
    :image: esp32.svg

Starting with ESPHome 2026.1.0, the default framework for ESP32 will change from Arduino to ESP-IDF. This guide will help you migrate your existing configurations or make an informed choice about which framework to use.

.. note::

    This change only affects ESP32, ESP32-S2, ESP32-S3, and ESP32-C3 variants. 
    Newer variants (ESP32-C6, ESP32-H2, ESP32-P4, etc.) already default to ESP-IDF 
    as they have limited or no Arduino support.

Why the Change?
---------------

ESP-IDF (Espressif IoT Development Framework) is the official development framework for ESP32. It offers several advantages:

- **Smaller Binaries**: Up to 40% reduction in binary size
- **Better Performance**: More optimized for ESP32 hardware
- **Custom Builds**: Firmware is built specifically for your device configuration
- **Active Development**: All ESPHome developers use and test with ESP-IDF
- **Latest Features**: New ESP32 features are available in ESP-IDF first

Trade-offs
----------

While ESP-IDF offers many benefits, there are some trade-offs to consider:

- **Compile Times**: Initial compilation takes approximately 25% longer
- **Component Compatibility**: Some components may need to be replaced with ESP-IDF compatible alternatives
- **Library Differences**: Arduino-specific libraries won't be available

Making Your Choice
------------------

Option 1: Migrate to ESP-IDF (Recommended)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Add the following to your ESP32 configuration:

.. code-block:: yaml

    esp32:
      board: esp32dev  # Your board type
      framework:
        type: esp-idf

Option 2: Stay with Arduino
^^^^^^^^^^^^^^^^^^^^^^^^^^^

If you prefer to continue using Arduino (which will remain supported), explicitly specify it:

.. code-block:: yaml

    esp32:
      board: esp32dev  # Your board type
      framework:
        type: arduino

Migration Steps
---------------

1. **Backup Your Configuration**: Always keep a backup of your working configuration before making changes.

2. **Check Component Compatibility**: When you compile with ESP-IDF, ESPHome will automatically notify you if any components are incompatible and suggest alternatives.

3. **Update Your Configuration**: Add the framework specification as shown above.

4. **Clean Build Files**: After changing frameworks, clean your build files:

   **Using ESPHome CLI:**
   
   .. code-block:: bash

       esphome clean your-config.yaml

   **Using ESPHome Dashboard:**
   
   - Click on the three-dot menu for your device
   - Select "Clean Build Files"

5. **Compile and Test**: Compile your configuration and test thoroughly:

   **Using ESPHome CLI:**
   
   .. code-block:: bash

       esphome compile your-config.yaml
       esphome upload your-config.yaml

   **Using ESPHome Dashboard:**
   
   - Click "INSTALL" on your device
   - Choose your preferred upload method (USB, OTA, etc.)
   - The dashboard will automatically compile and upload

Common Component Replacements
-----------------------------

When migrating to ESP-IDF, you may need to replace some components. ESPHome will automatically suggest alternatives when available:

**Components with ESP-IDF Alternatives:**

.. list-table::
    :header-rows: 1
    :widths: 50 50

    * - Arduino Component
      - ESP-IDF Alternative
    * - :doc:`bme680_bsec </components/sensor/bme680_bsec>`
      - :doc:`bme68x_bsec2 </components/sensor/bme68x_bsec2>`
    * - :doc:`fastled_clockless </components/light/fastled>`
      - :doc:`esp32_rmt_led_strip </components/light/esp32_rmt_led_strip>`
    * - :doc:`fastled_spi </components/light/fastled>`
      - :doc:`spi_led_strip </components/light/spi_led_strip>`
    * - :doc:`neopixelbus </components/light/neopixelbus>`
      - :doc:`esp32_rmt_led_strip </components/light/esp32_rmt_led_strip>`

**Arduino-Only Components:**

The following components currently require Arduino framework and don't have ESP-IDF alternatives yet:

- :doc:`ac_dimmer </components/output/ac_dimmer>` - AC dimmer control
- :doc:`dsmr </components/sensor/dsmr>` - Dutch Smart Meter integration
- :doc:`heatpumpir </components/climate/climate_ir>` - IR-based heat pump control
- :doc:`midea </components/climate/midea>` - Midea air conditioner control
- :doc:`WLED Effect </components/light/index>` - WLED UDP Realtime Control integration

If you need these components, you should continue using the Arduino framework.

.. note::

    Component compatibility is constantly improving. Check the component documentation
    or try compiling with ESP-IDF to see if alternatives have become available.

Troubleshooting
---------------

Compilation Errors
^^^^^^^^^^^^^^^^^^

If you encounter compilation errors after switching to ESP-IDF:

1. Check the error message for component compatibility issues
2. Look for suggested alternatives in the error output
3. Clean your build files and try again
4. Check the component documentation for ESP-IDF specific notes

Build Time
^^^^^^^^^^

ESP-IDF compilation takes approximately 25% longer than Arduino:

- On modern desktop systems: ~15-30 seconds additional time
- On Raspberry Pi 5: ~1 minute additional time  
- On Raspberry Pi 4 or older: 3-5 minutes additional time
- Subsequent builds are faster but still proportionally slower
- The longer build time is due to ESP-IDF's more comprehensive optimization process

Performance Considerations
^^^^^^^^^^^^^^^^^^^^^^^^^^

ESP-IDF generally offers better performance, but:

- Initial boot time might be slightly different
- Some timing-sensitive operations may need adjustment
- WiFi and Bluetooth behavior might have subtle differences

Frequently Asked Questions
--------------------------

**Q: Will Arduino framework be removed?**
   A: No, Arduino framework will continue to be supported. Only the default is changing.

**Q: Do I have to migrate immediately?**
   A: No, but you should explicitly specify your framework choice to avoid the automatic change in 2026.1.0.

**Q: Can I switch back to Arduino if ESP-IDF doesn't work for me?**
   A: Yes, you can switch between frameworks at any time by changing your configuration.

**Q: Will my existing devices be affected?**
   A: Only when you recompile. Devices already running will continue to work as before.

**Q: How do I know which framework my device is currently using?**
   A: Check your device's log output during boot, or look at your configuration file.

Getting Help
------------

If you encounter issues during migration:

1. Check the `ESPHome Discord <https://discord.gg/KhAMKrd>`__ for community support
2. Review component-specific documentation
3. Search existing `GitHub issues <https://github.com/esphome/esphome/issues>`__
4. Create a new issue if you find a bug

Remember, the migration is optional, and both frameworks will continue to be supported. Choose the option that best fits your needs!

See Also
--------

- :doc:`/components/esp32`
- :doc:`/guides/faq`
- `ESP-IDF Documentation <https://docs.espressif.com/projects/esp-idf/>`__
- `Arduino-ESP32 Documentation <https://docs.espressif.com/projects/arduino-esp32/>`__
