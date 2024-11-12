Store YAML component
====================

.. seo::
    :description: Stores the configuration file in the firmware.

This component can be used to store the flattened yaml in the firmware, to be retrieved in case the original was lost. The needed size in the firmware is typically a few kilobytes. The user can decide if it's worth it.

They way it works: `__init__.py` compresses `CORE.config` with a basic dictionary based compression into a global const byte array (`ESPHOME_YAML`) and can be logged with an action. 

Example configuration entry
---------------------------

.. code-block:: yaml

    store_yaml:
      show_in_dump_config: False
      show_secrets: True
      url: /config

.. _store_yaml-configuration_variables:

-  **show_in_dump_config** (*Optional*, boolean): Set to ``true`` to display the YAML during dump_config.
-  **show_secrets** (*Optional*, boolean): Replace `!secret ...` with their real values.
-  **url** (*Optional*, string): .

.. warning::

    `show_in_dump_config` may trigger a watchdog reboot and safe mode when the configuration is too large to be sent quickly.

``store_yaml.log`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^

Send YAML to the logger.

.. code-block:: yaml

    api:
      services:
        - service: 'log_yaml'
          then:
            - store_yaml.log

See Also
--------

- :apiref:`safe_mode/safe_mode.h`
- :ghedit:`Edit`
