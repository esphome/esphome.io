Home Assistant Time Source
==========================

The preferred way to get time in ESPHome is using Home Assistant.
With the ``homeassistant`` time platform, the :doc:`native API </components/api>` connection
to Home Assistant will be used to periodically synchronize the current time.

.. note::

    Although you might not plan to *export* states from the node and you do not need an entity of the node
    in Home Assistant, this component still requires you to register the node under Home Assistant. See:
    :ref:`connecting-your-device-to-home-assistant`.

.. code-block:: yaml

    # Example configuration entry
    time:
      - platform: homeassistant
        id: homeassistant_time

Configuration variables
-----------------------

- All options from :ref:`base_time_config`.


See Also
--------

- :ghedit:`Edit`
