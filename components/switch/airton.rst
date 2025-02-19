Airton Climate Switches
=======================

.. seo::
    :description: Instructions for setting up option control switches for Airton IR remote climate devices.

Additional switches to support additional features for Airton-built AC internal units.

.. code-block:: yaml

    # Example configuration entry
    switch:
      - platform: airton
        sleep_mode:
          name: Sleep Mode
        display:
          name: Display Light

Configuration variables:
------------------------

- **airton_id** (**Required**, :ref:`config-id`): The id of Airton IR remote climate component
- **display** (*Optional*): A switch that enables or disables Airton IR remote climate display light.
  All options from :ref:`Switch <config-switch>`.
- **sleep_mode** (*Optional*): A switch that enables or disables Airton IR remote climate sleep mode. Sleep mode not supported in Fan only mode and Auto heat or cool mode.
  All options from :ref:`Switch <config-switch>`.

See Also
--------

- :doc:`Airton IR Remote Climate </components/climate/climate_ir>`
- :doc:`Airton IR Remote Select </components/select/airton>`
- :ghedit:`Edit`
