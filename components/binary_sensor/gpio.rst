.. _gpio-binary-sensor:

GPIO Binary Sensor
==================

.. seo::
    :description: Instructions for setting up GPIO binary sensors with ESPHome.
    :image: gpio.svg

The GPIO Binary Sensor platform allows you to use any input pin on your
device as a binary sensor. By default, it uses hardware interrupts for 
efficient state change detection with minimal CPU usage.

.. figure:: images/gpio-ui.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: gpio
        pin: D2
        name: "Living Room Window"
        device_class: window

    # Example with interrupt configuration
    binary_sensor:
      - platform: gpio
        pin: GPIO13
        name: "Motion Sensor"
        # use_interrupt: true  # Default - uses interrupts
        interrupt_type: RISING  # Only detect low-to-high transitions

    # Example with polling mode (legacy behavior)
    binary_sensor:
      - platform: gpio
        pin: GPIO14
        name: "Legacy Sensor"
        use_interrupt: false  # Use polling instead of interrupts

Configuration variables:
------------------------

- **pin** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The pin to monitor.
- **use_interrupt** (*Optional*, boolean): Use hardware interrupts instead of polling for better 
  performance and lower CPU usage. Defaults to ``true``. Only supported on internal GPIO pins.
- **interrupt_type** (*Optional*, string): The type of interrupt to use. One of:

  - ``ANY`` (default): Trigger on any edge change (high to low or low to high)
  - ``RISING``: Trigger only on rising edge (low to high)
  - ``FALLING``: Trigger only on falling edge (high to low)

- All other options from :ref:`Binary Sensor <config-binary_sensor>`.

Interrupt Mode vs Polling Mode
------------------------------

The GPIO binary sensor supports two modes of operation:

**Interrupt Mode** (default, ``use_interrupt: true``):

- Uses hardware interrupts to detect pin state changes
- Extremely efficient - up to 98% lower CPU usage
- Updates are processed once per loop cycle (same as polling mode)
- Transitions shorter than the loop interval are ignored for backwards compatibility with polling mode
- Only processes when the pin actually changes state
- Recommended for most use cases

**Polling Mode** (``use_interrupt: false``):

- Continuously reads the pin state in the main loop
- Higher CPU usage but simpler implementation
- Transitions shorter than the loop interval are ignored
- Use only when interrupts are not supported or for compatibility

.. note::

    Interrupt mode is only available on internal GPIO pins. External GPIO 
    expanders (like PCF8574) will automatically fall back to polling mode.

Activating internal pullups
---------------------------

If you're hooking up a button without an external pullup or see lots of ON/OFF events
in the log output all the time, this often means the GPIO pin is floating.

For these cases you need to manually enable the pull-up (or pull-down) resistors on the ESP,
you can do so with the :ref:`Pin Schema <config-pin_schema>`.

.. code-block:: yaml

    binary_sensor:
      - platform: gpio
        pin:
          number: D2
          mode:
            input: true
            pullup: true
        name: ...

Inverting Values
----------------

Use the ``inverted`` property of the :ref:`Pin Schema <config-pin_schema>` to invert the binary
sensor:

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: gpio
        pin:
          number: D2
          inverted: true
        name: ...

Debouncing Values
-----------------

Some binary sensors are a bit unstable and quickly transition between the ON and OFF state while
they're pressed. To fix this and debounce the signal, use the :ref:`binary sensor filters <binary_sensor-filters>`:

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: gpio
        pin: D2
        name: ...
        filters:
          - delayed_on: 10ms

Above example will only make the signal go high if the button has stayed high for more than 10ms.
Alternatively, below configuration will make the binary sensor publish an ON value immediately, but
will wait 10ms before publishing an OFF value:

.. code-block:: yaml

    # Example configuration entry
    binary_sensor:
      - platform: gpio
        pin: D2
        name: ...
        filters:
          - delayed_off: 10ms

See Also
--------

- :doc:`/components/binary_sensor/index`
- :ref:`config-pin_schema`
- :apiref:`gpio/binary_sensor/gpio_binary_sensor.h`
- :ghedit:`Edit`
