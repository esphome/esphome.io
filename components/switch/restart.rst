Restart Switch
==============

.. seo::
    :description: Instructions for setting up switches that can remotely reboot the ESP in ESPHome.
    :image: restart.svg

The ``restart`` switch platform allows you to restart your node remotely
through Home Assistant.

.. figure:: images/restart-ui.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    switch:
      - platform: restart
        name: "Living Room Restart"

Configuration variables:
------------------------

- All options from :ref:`Switch <config-switch>`.

See Also
--------

- :doc:`shutdown`
- :doc:`safe_mode`
- :doc:`factory_reset`
- :doc:`/components/button/restart`
- :doc:`template`
- :apiref:`restart/switch/restart_switch.h`
- :ghedit:`Edit`
