Haier Climate Text Sensors
==========================

.. seo::
    :description: Instructions for setting up additional Text sensors for Haier climate devices.
    :image: haier.svg

Additional sensors for Haier Climate device. **These sensors are supported only by the hOn protocol**.

.. code-block:: yaml

    # Example configuration entry
    text_sensor:
      - platform: haier
        haier_id: haier_ac
        appliance_name:
          name: Haier appliance name
        cleaning_status:
          name: Haier cleaning status
        protocol_version:
          name: Haier protocol version

Configuration variables:
------------------------

- **haier_id** (**Required**, :ref:`config-id`): The id of haier climate component
- **appliance_name** (*Optional*): A text sensor that indicates Haier appliance name.
  All options from :ref:`Text Sensor <config-text_sensor>`.
- **cleaning_status** (*Optional*): A text sensor that indicates cleaning status. Possible values "No cleaning", "Self clean", "56°C Steri-Clean".
  All options from :ref:`Text Sensor <config-text_sensor>`.
- **protocol_version** (*Optional*): A text sensor that indicates Haier protocol version.
  All options from :ref:`Text Sensor <config-text_sensor>`.

See Also
--------

- :doc:`Haier Climate </components/climate/haier>`
- :ghedit:`Edit`
