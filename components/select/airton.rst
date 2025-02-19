Airton Climate Select
=======================

.. seo::
    :description: Instructions for setting up option control select for Airton IR remote climate devices.

Additional select to support the vertical air outlet direction for Airton-built AC internal units.

.. code-block:: yaml

    # Example configuration entry
    select:
      - platform: airton
        vertical_direction:
          name: "Vertical direction"
          id: direction

Configuration variables:
------------------------

- **airton_id** (**Required**, :ref:`config-id`): The id of Airton IR remote climate component
- **vertical_diraction** (*Optional*): A select that changes the vertical direction mode for an Airton IR component. Accepted values are ``off``, ``swing``, ``up``, ``middle-up``, ``middle``, ``middle-down``, ``down``.
  All options from :ref:`Select <config-select>`.

See Also
--------

- :doc:`Airton IR Remote Climate </components/climate/climate_ir>`
- :doc:`Airton IR Remote Switch </components/switch/airton>`
- :ghedit:`Edit`
