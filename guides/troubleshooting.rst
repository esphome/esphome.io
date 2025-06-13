Troubleshooting
===============

.. seo::
    :description: Guide for troubleshooting ESPHome issues and debugging crashes.
    :image: bug-report.svg

This guide covers common troubleshooting techniques for ESPHome, including how to debug crashes and obtain backtraces.

Getting a Backtrace from Crashes
--------------------------------

When your ESPHome device crashes, you can obtain a decoded backtrace to help identify the cause. This requires:

1. Compiling the firmware locally (to have matching debug symbols)
2. Connecting the device via USB cable for serial console access
3. Running the logs command to capture and decode the crash

Steps to Get a Backtrace
~~~~~~~~~~~~~~~~~~~~~~~~

1. **Compile locally**: Build your configuration on your local machine to ensure you have matching debug symbols.

   If you're using the ESPHome Device Builder web interface:
   
   - Click the overflow menu (three dots) next to your device
   - Select "Download YAML" to get your configuration file
   - Save it to a local directory
   
   Then use the command line interface (see the :doc:`/guides/cli` guide for full details):

   .. code-block:: bash

       esphome compile your-device.yaml
       esphome upload your-device.yaml

   .. note::

       While you can use OTA for the upload, you'll need a USB connection anyway to capture the crash output in the next steps, so uploading via USB is usually more convenient.

2. **Connect via USB**: Connect your device to your computer using a USB cable. The device must be connected via serial console (not over WiFi/OTA) to capture the crash output.

3. **Monitor logs**: Run the logs command to monitor the device output:

   .. code-block:: bash

       esphome logs your-device.yaml

4. **Wait for crash**: When the device crashes, ESPHome will automatically detect and decode the backtrace. You'll see output similar to this:

   .. code-block:: text

       [08:17:06]E (5906) task_wdt: Task watchdog got triggered. The following tasks/users did not reset the watchdog in time:
       [08:17:06]E (5906) task_wdt:  - loopTask (CPU 0)
       [08:17:06]E (5906) task_wdt: Tasks currently running:
       [08:17:06]E (5906) task_wdt: CPU 0: esp_timer
       [08:17:06]E (5906) task_wdt: CPU 1: IDLE1
       [08:17:06]E (5906) task_wdt: Aborting.
       [08:17:06]E (5906) task_wdt: Print CPU 0 (current core) backtrace
       
       
       
       
       [08:17:06]Backtrace: 0x4013d30e:0x3ffbac20 0x4013d383:0x3ffbac40 0x4014b23e:0x3ffbac70
       WARNING Found stack trace! Trying to decode it
       WARNING Decoded 0x4013d30e: touch_ll_is_measure_done at /Users/bdraco/.platformio/packages/framework-espidf/components/hal/esp32/include/hal/touch_sensor_ll.h:505
        (inlined by) _touch_pad_read at /Users/bdraco/.platformio/packages/framework-espidf/components/driver/touch_sensor/esp32/touch_sensor.c:365
       WARNING Decoded 0x4013d383: touch_pad_filter_cb at /Users/bdraco/.platformio/packages/framework-espidf/components/driver/touch_sensor/esp32/touch_sensor.c:108
        (inlined by) touch_pad_filter_cb at /Users/bdraco/.platformio/packages/framework-espidf/components/driver/touch_sensor/esp32/touch_sensor.c:98
       WARNING Decoded 0x4014b23e: timer_process_alarm at /Users/bdraco/.platformio/packages/framework-espidf/components/esp_timer/src/esp_timer.c:456
        (inlined by) timer_task at /Users/bdraco/.platformio/packages/framework-espidf/components/esp_timer/src/esp_timer.c:482

The decoded backtrace shows:
- The exact function names and source files where the crash occurred
- Line numbers in the source code
- The call stack leading to the crash

.. note::

    **Important**: You must compile locally and upload the firmware before capturing the crash. The debug symbols must match the running firmware for the backtrace to be decoded correctly.

Common Issues
~~~~~~~~~~~~~

- **No decoded output**: Ensure you compiled and uploaded the firmware locally before capturing the crash
- **Cannot connect**: Make sure you're using a USB data cable (not just a charging cable) and the correct serial port

See Also
--------

- :doc:`/components/logger` - Configure logging levels and outputs
- :doc:`/components/debug` - Debug component for additional diagnostics
- :doc:`/guides/faq` - Frequently asked questions