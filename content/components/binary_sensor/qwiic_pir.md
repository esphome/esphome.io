Qwiic PIR Motion Binary Sensor
==============================

.. seo::
    :description: Instructions for setting up the Qwiic PIR Motion binary sensor.
    :image: qwiic_pir.jpg

The Qwiic PIR Motion binary sensor allows you to use your Qwiic PIR (`EKMC4607112K based <https://www.sparkfun.com/products/17374>`__, `EKMB1107112 based <https://www.sparkfun.com/products/17375>`__, `firmware documentation <https://github.com/sparkfun/Qwiic_PIR>`__)
sensors from SparkFun with ESPHome.

.. figure:: images/qwiic_pir.jpg
    :align: center
    :width: 30.0%

    SparkFun Qwiic PIR sensor.
    (Credit: `Sparkfun <https://www.sparkfun.com/products/17374>`__, image cropped and compressed)

.. _Sparkfun: https://www.sparkfun.com/products/17374

The SparkFun Qwiic PIR Motion binary sensor uses PIR sensors to detect motion. It communicates over I²C. There are two models currently available. One uses the `Panasonic EKMC4607112K sensor <https://cdn.sparkfun.com/assets/7/2/a/4/3/EKMC460711xK_Spec.pdf>`__, and the other uses the `Panasonic EKMB1107112 sensor <https://cdn.sparkfun.com/assets/c/e/8/7/5/EKMB110711x_Spec.pdf>`__. 

You can configure a debounce mode to reduce noise and false detections. See :ref:`debounce-modes` for the available options.

To use the sensor, first set up an :ref:`I²C Bus <i2c>` and connect the sensor to the specified pins.

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: qwiic_pir
        name: "Qwiic PIR Motion Sensor"

Configuration variables:
------------------------

- **debounce_mode** (*Optional*, enum): How the component debounces the motion sensor's signal. Must be one of ``HYBRID``, ``NATIVE``, or ``RAW``. See :ref:`debounce-modes` for details. Defaults to ``HYBRID``.
- **debounce** (*Optional*, :ref:`config-time`): Only valid when using ``NATIVE`` debounce mode. Configures the debounce time on the sensor to reduce noise and false detections. Defaults to ``1ms``.

-  All other options from :ref:`Binary Sensor <config-binary_sensor>`.

.. _debounce-modes:

Debounce Modes
**************

There are three options for ``debounce_mode``.

- ``HYBRID``:

    - Use a combination of the raw sensor reading and the sensor's native event detection to determine state.
    - Very reliable for detecting both object's being detected and no longer detected.
    - Use binary sensor filters to reduce noise and false detections.

- ``NATIVE``:
    
    - Use the sensor's native event detection to debounce the signal.
    - Logic follows `SparkFun's reference example implementation <https://github.com/sparkfun/SparkFun_Qwiic_PIR_Arduino_Library/blob/master/examples/Example2_PrintPIRStatus/Example2_PrintPIRStatus.ino>`__.
    - May be unreliable at detecting when an object is removed, especially at high debounce rates.
    - Binary sensor filters are not necessary to reduce noise and false detections.

- ``RAW``:
    
    - Use the raw state of the PIR sensor as reported by the firmware.
    - May miss a very short motion detection events if ESPHome's loop time is slow.
    - Use binary sensor filters to reduce noise and false detections.

See Also
--------
- :doc:`/components/binary_sensor/index`
- :apiref:`qwiic_pir/qwiic_pir.h`
- `SparkFun Qwiic PIR Library <https://github.com/sparkfun/SparkFun_Qwiic_PIR_Arduino_Library>`__ by `SparkFun <https://www.sparkfun.com/>`__
- :ghedit:`Edit`
