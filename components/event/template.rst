Template Event
==============

.. seo::
    :description: Instructions for setting up template events that can trigger arbitrary automations when an event occurs.
    :image: description.svg

The ``template`` event platform enables you to define events that trigger specific automations or actions within Home Assistant. These custom events can be utilized to orchestrate complex behaviors across your smart home ecosystem based on conditions or sequences defined in your ESPHome configuration.

.. code-block:: yaml

    # Example configuration entry
    event:
      - platform: template
        name: "Template Event"
        event_types:
          - "custom_event_1"
          - "custom_event_2"

Configuration variables:
------------------------

- **event_types** (**Required**, list): A list of custom event identifiers that this template event is capable of triggering. These identifiers can be used in Home Assistant automations or ESPHome scripts to perform actions when the event occurs.
- All other options from :ref:`Event <config-event>`.

See Also
--------

- :doc:`/automations/index`
- :doc:`/components/event/index`
- :ghedit:`Edit`
