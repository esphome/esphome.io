Haier Climate Buttons
=====================

.. seo::
    :description: Instructions for setting up additional buttons for Haier climate devices.
    :image: haier.svg

Additional buttons for Haier AC cleaning. **These buttons are supported only by the hOn protocol**.

.. code-block:: yaml

    # Example configuration entry
    button:
      - platform: haier
        haier_id: haier_ac
        self_cleaning:
          name: Haier start self cleaning
        steri_cleaning:
          name: Haier start 56°C steri-cleaning

Configuration variables:
------------------------

- **haier_id** (**Required**, :ref:`config-id`): The id of Haier climate component
- **self_cleaning** (*Optional*): A button that starts Haier climate self cleaning.
  All options from :ref:`Button <config-button>`.
- **steri_cleaning** (*Optional*): A button that starts Haier climate 56°C Steri-Clean.
  All options from :ref:`Button <config-button>`.

See Also
--------

- :doc:`Haier Climate </components/climate/haier>`
- :ghedit:`Edit`
