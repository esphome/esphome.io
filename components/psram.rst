PSRAM
=====

.. seo::
    :description: Configuration for the ESP32 PSRAM platform for ESPHome.
    :image: psram.svg

This component enables and configures PSRAM if/when available on ESP32 modules/boards.
It is automatically loaded and enabled by some, but not all components that require it.
For instance it is not enabled automatically in the ``ili9xxx`` display driver.

PSRAM is only available on the ESP32.

.. code-block:: yaml

    # Example configuration entry
    psram:
      mode: octal
      speed: 80MHz

Configuration variables:
------------------------

- **mode** (*Optional*): Defines the operating mode the PSRAM should utilize. One of ``quad`` or ``octal``.
- **speed** (*Optional*, int): The speed at which the PSRAM should operate. One of ``40MHz``, ``80MHz`` or ``120MHz``.
  Note that ``80MHz`` and ``120MHz`` are not supported on all modules; in addition, ``120MHz`` is considered
  "experimental" at the time this document was written.

See Also
--------

- :ghedit:`Edit`
