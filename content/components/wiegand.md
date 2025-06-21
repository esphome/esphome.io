Wiegand keypad and tag reader
=============================

.. seo::
    :description: Wiegand-standard key input and card/tag reader panel
    :image: wiegand.jpg

The ``wiegand`` component allows you to integrate Wiegand-standard key
input and card or tag reader panels in Home Assistant.

.. figure:: ../images/wiegand.jpg
    :align: center

    S20-ID keypad and tag reader


.. note::

    Some keypads are preconfigured by the factory to act as Wiegand input
    devices. In order to work with this component, they may need to
    be reconfigured to act as *Wiegand 26 output* or *Wiegand 34 output*
    devices.


Component
---------

.. code-block:: yaml

    # Example configuration entry
    wiegand:
      - id: mykeypad
        d0: GPIOXX
        d1: GPIOXX
        on_key:
          - lambda: ESP_LOGI("KEY", "received key %d", x);
        on_tag:
          - lambda: ESP_LOGI("TAG", "received tag %s", x.c_str());
        on_raw:
          - lambda: ESP_LOGI("RAW", "received raw %d bits, value %llx", bits, value);



Configuration variables:

- **id** (*Optional*, :ref:`config-id`): Set the ID of this device for use in lambdas.
- **d0** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The pin where the ``D0`` output
  of the Wiegand's interface connects.
- **d1** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The pin where the ``D1`` output
  of the Wiegand's interface connects.


Automations:
------------

- **on_key** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  when a key has been pressed on the pad. The key is in a variable called ``x``.
- **on_tag** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  when a Wiegand-compatible card or a tag has been read by the device. The tag code is
  in a variable called ``x``.
- **on_raw** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  for any data sent by the device. The value is in a variable called ``value``, the number of
  bits is in a variable called ``bits``.  Note that this will include parity bits as well and
  no parity checking is done.


.. note::

    Automatic handling of multiple keys (e.g. PIN code entry) is possible with the
    the :ref:`Key Collector <key_collector>` component.

    Keys 10 and 11 are ``*`` and ``#``.  They might be labelled as ``ENT`` or ``ESC``,
    but check the logs to see which key code you get and use the corresponding character.


See Also
--------

- :doc:`/components/key_collector`
- :ghedit:`Edit`
