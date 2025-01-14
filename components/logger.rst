.. _logger:

Logger Component
================

.. seo::
    :description: Instructions for setting up the central logging component in ESPHome.
    :image: file-document-box.svg

The logger component automatically logs all log messages through the
serial port and through MQTT topics (if there is an MQTT client in the
configuration). By default, all logs with a severity ``DEBUG`` or higher will be shown.
Increasing the log level severity (to e.g ``INFO`` or ``WARN``) can help with the performance of the application and memory size.

.. code-block:: yaml

    # Example configuration entry
    logger:
      level: DEBUG

Configuration variables:
------------------------

-  **baud_rate** (*Optional*, int): The baud rate to use for the serial
   UART port. Defaults to ``115200``. Set to ``0`` to disable logging via UART.
-  **level** (*Optional*, string): The global log level. Any log message
   with a lower severity will not be shown. Defaults to ``DEBUG``.
-  **logs** (*Optional*, mapping): Manually set the log level for a
   specific component or tag. See :ref:`Manual Log Levels for more
   information <logger-manual_tag_specific_levels>`.
-  **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.

Advanced settings:

-  **tx_buffer_size** (*Optional*, int): The size of the buffer used
   for log messages. Decrease this if you’re having memory problems.
   Defaults to ``512``.
-  **hardware_uart** (*Optional*, string): The Hardware UART to use for logging. The default varies depending on
   the specific processor/chip and framework you are using. See the :ref:`table below <logger-default_hardware_interfaces>`.
-  **esp8266_store_log_strings_in_flash** (*Optional*, boolean): If set to false, disables storing
   log strings in the flash section of the device (uses more memory). Defaults to true.
-  **on_message** (*Optional*, :ref:`Automation <automation>`): An action to be
   performed when a message is to be logged. The variables ``int level``, ``const char* tag`` and
   ``const char* message`` are available for lambda processing.
-  **deassert_rts_dtr** (*Optional*, boolean): Deasserts RTS/DTR when opening
   log over UART. This is useful if RTS/DTR signals are directly connected to
   the reset pin or strapping pins. Note: Deassert typically means high on TTL
   level since RTS/DTR are usually low active signals. Defaults to ``false``.

.. _logger-hardware_uarts:

Hardware UARTs
--------------

The logger component makes use of platform-specific hardware UARTs for serial logging. For example, the ESP32
has three hardware UARTs, all of which can be used for both transmit and receive. The ESP8266 only has two
hardware UARTs, one of which is transmit-only. The ESP8266's ``UART0`` can also be "swapped" to TX/RX on the
CTS/RTS pins in the event that you need to use GPIO1 and GPIO3 for something else.

Note that many common boards have their USB-to-serial adapters fixed to the default GPIOs used by ``UART0``,
so if you use any other configuration you will not get log messages over the on-board USB.

Default UART GPIO Pins
**********************

.. list-table::
    :header-rows: 1

    * - 
      - ``UART0``
      - ``UART0_SWAP``
      - ``UART1``
      - ``UART2``
      - ``USB_CDC``
      - ``USB_SERIAL_JTAG``
    * - ESP8266
      - TX: 1, RX: 3
      - TX: 15, RX: 13
      - TX: 2, RX: N/A
      - N/A
      - N/A
      - N/A
    * - ESP32
      - TX: 1, RX: 3
      - N/A
      - TX: 10, RX: 9
      - TX: 17, RX: 16
      - N/A
      - N/A
    * - ESP32-C3
      - TX: 21, RX: 20
      - N/A
      - Undefined
      - N/A
      - N/A
      - 18/19
    * - ESP32-S2
      - TX: 43, RX: 44
      - N/A
      - TX: 17, RX: 18
      - N/A
      - 19/20
      - N/A
    * - ESP32-S3
      - TX: 43, RX: 44
      - N/A
      - TX: 17, RX: 18
      - Undefined
      - 19/20
      - 19/20

*Undefined* means that the logger component cannot use this harware UART at this time.

.. _logger-default_hardware_interfaces:

Default Hardware Interfaces
---------------------------

Because of the wide variety of boards and processors/chips available, we've selected varying default
hardware interfaces for logging. Many newer boards based on ESP32 variants (such as the C3, S2 and S3)
are using the ESP's on-board USB hardware peripheral while boards based on older processors (such as
the original ESP32 or ESP8266) continue to use USB-to-serial bridge ICs for communication.

.. list-table::
    :header-rows: 1

    * - 
      - Arduino
      - ESP-IDF
    * - ESP8266
      - ``UART0``
      - N/A
    * - ESP32
      - ``UART0``
      - ``UART0``
    * - ESP32-C3
      - ``USB_CDC``
      - ``USB_SERIAL_JTAG``
    * - ESP32-S2
      - ``USB_CDC``
      - ``USB_CDC``
    * - ESP32-S3
      - ``USB_CDC``
      - ``USB_SERIAL_JTAG``
    * - RP2040
      - ``USB_CDC``
      - N/A

.. _logger-log_levels:

Log Levels
----------

Possible log levels are (sorted by severity):

-  ``NONE``

  - No messages are logged.

-  ``ERROR``

  - With this log level, only errors are logged. Errors are issues that prevent the ESP from working
    correctly. Color: red

-  ``WARN``

  - With this log level, warnings and errors are logged. Warnings are issues like invalid readings from
    sensors that ESPHome can recover from. Color: yellow

-  ``INFO``

  - With this log level, everything up to info messages are logged; so errors, warnings and info. Color: green

-  ``DEBUG`` (**Default**)

  - Everything up to this log level is logged. Debug messages include the current readings from a sensor
    and status messages. Color: cyan

-  ``VERBOSE``

  - Like debug, but a few more messages that are usually deemed to be spam are also included. Color: grey

-  ``VERY_VERBOSE``

  - All internal messages are logged. Including all the data flowing through data buses like
    I²C, SPI or UART. Warning: May cause the device to slow down and have trouble staying
    connecting due to amount of generated messages. Color: white

.. _logger-manual_tag_specific_levels:

Manual Tag-Specific Log Levels
------------------------------

If some component is spamming the logs and you want to manually set the
log level for it, first identify the tag of the log messages in question
and then disable them in your configuration.

Suppose we want to have verbose log messages globally, but the MQTT
client spams too much. In the following example, we’d first see that the
tag of the MQTT client is ``mqtt.client`` (before the first colon) and
the tag for MQTT components is ``mqtt.component``.

.. figure:: images/logger-manual_log_level.png

Next, we can manually set the log levels in the configuration like this:

.. code-block:: yaml

    logger:
      level: VERBOSE
      logs:
        mqtt.component: DEBUG
        mqtt.client: ERROR

Please note that the global log level determines what log messages are
saved in the binary. So for example an ``INFO`` global log message will
purge all ``DEBUG`` log statements from the binary in order to conserve
space. This however means that you cannot set tag-specific log levels
that have a lower severity than the global log level.

.. _logger-log_action:

``logger.log`` Action
---------------------

Print a formatted message to the logs.

In the ``format`` option, you can use ``printf``-style formatting (see :ref:`display-printf`).

.. code-block:: yaml

    on_...:
      then:
        - logger.log: "Hello World"

        # Formatted:
        - logger.log:
            format: "The temperature sensor reports value %.1f and humidity %.1f"
            args: [ 'id(temperature_sensor).state', 'id(humidity_sensor).state' ]

Configuration options:

-  **format** (**Required**, string): The format for the message in :ref:`printf-style <display-printf>`.
-  **args** (*Optional*, list of :ref:`lambda <config-lambda>`): The optional arguments for the
   format message.
-  **level** (*Optional*, string): The :ref:`log level <logger-log_levels>` to print the message
   with. Defaults to ``DEBUG``.
-  **tag** (*Optional*, string): The tag (seen in front of the message in the logs) to print the message
   with. Defaults to ``main``.

Logger Automation
-----------------

.. _logger-on_message:

``on_message``
**************

This automation will be triggered when a new message is added to the log.
In :ref:`lambdas <config-lambda>` you can get the message, log level and tag from the trigger
using ``message`` (``const char *``), ``level`` (``int``) and ``tag`` (``const char *``).

.. code-block:: yaml

    logger:
      # ...
      on_message:
        level: ERROR
        then:
          - mqtt.publish:
              topic: some/topic
              payload: !lambda |-
                return "Triggered on_message with level " + to_string(level) + ", tag " + tag + " and message " + message;

.. note::

    Logging will not work in the ``on_message`` trigger. You can't use the :ref:`logger.log <logger-log_action>` action
    and the ``ESP_LOGx`` logging macros in this automation.

See Also
--------

- :doc:`/components/uart`
- :apiref:`logger/logger.h`
- :ghedit:`Edit`
