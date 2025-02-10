Template Text Sensor
====================

.. seo::
    :description: Instructions for setting up template text sensors in ESPHome
    :image: description.svg

The ``template`` text sensor platform allows you to create a text sensor with templated values
using :ref:`lambdas <config-lambda>`.

.. code-block:: yaml

    # Example configuration entry
    text_sensor:
      - platform: template
        name: "Template Text Sensor"
        lambda: |-
          return {"Hello World"};
        update_interval: 60s


Possible return values for the lambda:

 - ``return {"STRING LITERAL"};`` the new value for the sensor of type ``std::string``. **Has to be** in
   brackets ``{}``!
 - ``return {};`` if you don't want to publish a new state (advanced).

Configuration variables:
------------------------

- **lambda** (*Optional*, :ref:`lambda <config-lambda>`):
  Lambda to be evaluated every update interval to get the new value of the text sensor
- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the
  text sensor. Set to ``never`` to disable updates. Defaults to ``60s``.
- All other options from :ref:`Text Sensor <config-text_sensor>`.

.. _text_sensor-template-publish_action:

``text_sensor.template.publish`` Action
---------------------------------------

You can also publish a state to a template text sensor from elsewhere in your YAML file
with the ``text_sensor.template.publish`` action.

.. code-block:: yaml

    # Example configuration entry
    text_sensor:
      - platform: template
        name: "Template Text Sensor"
        id: template_text

    # in some trigger
    on_...:
      - text_sensor.template.publish:
          id: template_text
          state: "Hello World"

      # Templated
      - text_sensor.template.publish:
          id: template_text
          state: !lambda 'return "Hello World";'

Configuration options:

- **id** (**Required**, :ref:`config-id`): The ID of the template text sensor.
- **state** (**Required**, string, :ref:`templatable <config-templatable>`):
  The state to publish.

.. note::

    This action can also be written in lambdas:

    .. code-block:: cpp

        id(template_text).publish_state("Hello World");

Useful Template Sensors
-----------------------

Here are some useful text sensors for debugging and tracking project info.

.. code-block:: yaml

    # Example configuration entry
    text_sensor:
      - platform: template
        name: "ESPHome Project Version"
        id: esphome_project_version_text_short
        icon: "mdi:information-box"
        entity_category: "diagnostic"
        update_interval: 600s
        lambda: |-
          return { ESPHOME_PROJECT_VERSION };

      - platform: template
        name: "ESPHome Project Version Detailed"
        id: esphome_project_version_text_detailed
        icon: "mdi:information-box"
        entity_category: "diagnostic"
        update_interval: 600s
        lambda: |-
          return { ESPHOME_PROJECT_VERSION " " + App.get_compilation_time() };

      - platform: template
        name: "ESPHome Project Name"
        id: esphome_project_name
        icon: "mdi:information-box"
        entity_category: "diagnostic"
        update_interval: 600s
        lambda: |-
          return { ESPHOME_PROJECT_NAME };

See Also
--------

- :doc:`/components/text_sensor/index`
- :ref:`automation`
- :apiref:`template/text_sensor/template_text_sensor.h`
- :ghedit:`Edit`
