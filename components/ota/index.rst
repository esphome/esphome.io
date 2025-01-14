Over-the-Air Updates
====================

.. seo::
    :description: Instructions for setting up the Over-The-Air (OTA) component to allow remote updating of devices.
    :image: system-update.svg

.. _config-ota:

ESPHome supports remotely updating a device "over-the-air" (OTA). Each update mechanism is a *platform* of the base
``ota`` component and will have its own configuration variables.

In release 2024.6.0, the ``ota`` component transistioned from a standalone component to a *platform* component. This
change was made to facilitate the use of multiple update mechanisms, enabling greater flexibility.

.. code-block:: yaml

    # Example configuration entry
    ota:
      - platform: ...

Platforms
---------

.. toctree::
    :maxdepth: 1
    :glob:

    *

Configuration variables:
------------------------

-  **on_begin** (*Optional*, :ref:`Automation<automation>`): An action to be performed when an OTA update is started.
   See :ref:`ota-on_begin`.
-  **on_progress** (*Optional*, :ref:`Automation<automation>`): An action to be performed (approximately each second)
   while an OTA update is in progress. See :ref:`ota-on_progress`.
-  **on_end** (*Optional*, :ref:`Automation<automation>`): An action to be performed after a successful OTA update.
   See :ref:`ota-on_end`.
-  **on_error** (*Optional*, :ref:`Automation<automation>`): An action to be performed after a failed OTA update.
   See :ref:`ota-on_error`.
-  **on_state_change** (*Optional*, :ref:`Automation<automation>`): An action to be performed when an OTA update state
   change happens. See :ref:`ota-on_state_change`.

.. _ota-automations:

OTA Automations
---------------

The OTA component provides various :ref:`automations <automation>` that can be used to provide feedback during the OTA
update process. When using these automation triggers, note that:

- OTA updates block the main application loop while in progress. You won't be able to represent state changes using
  components that update their output only from within their ``loop()`` method. Explained differently: if you try to
  display the OTA progress using component X, but the update only appears after the OTA update finished, then component
  X cannot be used for providing OTA update feedback.
- Your automation action(s) must not consume any significant amount of time; if they do, OTA updates may fail.

.. _ota-on_begin:

``on_begin``
************

This automation will be triggered when an OTA update is started.

.. code-block:: yaml

    ota:
      - platform: ...
        on_begin:
          then:
            - logger.log: "OTA start"

.. _ota-on_progress:

``on_progress``
***************

Using this automation, it is possible to report on the OTA update progress. It will be triggered repeatedly during the
OTA update. You can get the actual progress percentage (a value between 0 and 100) from the trigger with variable ``x``.

.. code-block:: yaml

    ota:
      - platform: ...
        on_progress:
          then:
            - logger.log:
                format: "OTA progress %0.1f%%"
                args: ["x"]

.. _ota-on_end:

``on_end``
**********

This automation will be triggered when an OTA update has completed successfully, immediately before the device is
rebooted.

Because the update has completed, you can safely use (an) automation action(s) that takes some time to complete. If,
for example, you want to flash an LED, multiple pauses/delays would be required to make the LED blink a few times,
before the reboot. The OTA update can't fail at this point because it is already complete.

.. code-block:: yaml

    ota:
      - platform: ...
        on_end:
          then:
            - logger.log: "OTA end"

.. _ota-on_error:

``on_error``
************

This automation will be triggered when an OTA update has failed. You can get the internal error code with variable ``x``.

Just like for :ref:`ota-on_end`, you can safely use an automation that takes some time to complete as the OTA update
process has already finished.

.. code-block:: yaml

    ota:
      - platform: ...
        on_error:
          then:
            - logger.log:
                format: "OTA update error %d"
                args: ["x"]

.. _ota-on_state_change:

``on_state_change``
*******************

This automation will be triggered on every state change. You can get the actual state with variable ``state``, which
will contain one of values for the ``OTAState`` enum. These values are:

-  ``ota::OTA_STARTED``
-  ``ota::OTA_IN_PROGRESS`` *(will be called repeatedly during the update)*
-  ``ota::OTA_COMPLETED``
-  ``ota::OTA_ERROR``

.. code-block:: yaml

    ota:
      - platform: ...
        on_state_change:
          then:
            - if:
                condition:
                  lambda: return state == ota::OTA_STARTED;
                then:
                  - logger.log: "OTA start"

Safe Mode
---------

In addition to OTA updates, ESPHome also supports a "safe mode" to help with recovery if/when updates don't work as
expected. This is automatically enabled by the ``ota`` component, but it may be disabled if desired. See
:doc:`/components/safe_mode` for details.

See Also
--------

- :apiref:`ota/ota_component.h`
- :doc:`/components/safe_mode`
- :ghedit:`Edit`
