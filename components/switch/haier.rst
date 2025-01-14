Haier Climate Switches
======================

.. seo::
    :description: Instructions for setting up additional switches for Haier climate devices.
    :image: haier.svg

Additional switches to support additional features for Haier AC.

.. code-block:: yaml

    # Example configuration entry
    switch:
      - platform: haier
        beeper:
          name: Haier beeper
        health_mode:
          name: Haier health mode
        display:
          name: Haier display
        quiet_mode:
          name: Haier quiet mode

Configuration variables:
------------------------

- **haier_id** (**Required**, :ref:`config-id`): The id of Haier climate component
- **beeper** (*Optional*): (supported only by hOn) A switch that enables or disables Haier climate sound feedback.
  All options from :ref:`Switch <config-switch>`.
- **health_mode** (*Optional*): A switch that enables or disables Haier climate health mode (`UV light sterilization <https://www.haierhvac.eu/en/node/1809>`__).
  All options from :ref:`Switch <config-switch>`.
- **display** (*Optional*): A switch that enables or disables Haier climate led display.
  All options from :ref:`Switch <config-switch>`.
- **quiet_mode** (*Optional*): (supported only by hOn) A switch that enables or disables Haier climate quiet mode. Quiet mode not supported in Fan only mode.
  All options from :ref:`Switch <config-switch>`.

See Also
--------

- :doc:`Haier Climate </components/climate/haier>`
- :ghedit:`Edit`
