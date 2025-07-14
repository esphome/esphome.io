Deep_sleep Switch
=================

.. seo::
    :description: Instructions for setting up switches that can remotely shut down the ESP.
    :image: power_settings.svg

The ``deep_sleep`` switch platform allows you to prevent the node to go to deep sleep. 

.. figure:: images/shutdown-ui.png
    :align: center
    :width: 80.0%

.. code-block:: yaml

    # Example configuration entry
    switch:
      - platform: deep_sleep
        name: "Living Room Shutdown"

Configuration variables:
------------------------

- All options from :ref:`Switch <config-switch>`.

See Also
--------

- :doc:`/components/deep_sleep`
- :doc:`/components/button/deep_sleep`
- :doc:`template`
- :apiref:`deep_sleep/deep_sleep_switch.h`
- :ghedit:`Edit`
