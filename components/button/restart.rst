Restart Button
==============

.. seo::
    :description: Instructions for setting up buttons that can remotely reboot the ESP in ESPHome.
    :image: restart.svg

The ``restart`` button platform allows you to restart your node remotely
through Home Assistant.

.. code-block:: yaml

    # Example configuration entry
    button:
      - platform: restart
        name: "Living Room Restart"

Configuration variables:
------------------------

- All options from :ref:`Button <config-button>`.

See Also
--------

- :doc:`shutdown`
- :doc:`safe_mode`
- :doc:`factory_reset`
- :doc:`/components/switch/restart`
- :doc:`template`
- :apiref:`restart/button/restart_button.h`
- :ghedit:`Edit`
