Template Sensor
===============

.. seo::
    :description: Instructions for setting up template sensors with ESPHome.
    :image: description.svg

The ``template`` sensor platform allows you to create a sensor with templated values
using :ref:`lambdas <config-lambda>`.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: template
        name: "Template Sensor"
        lambda: |-
          if (id(some_binary_sensor).state) {
            return 42.0;
          } else {
            return 0.0;
          }
        update_interval: 60s


Possible return values for the lambda:

 - ``return <FLOATING_POINT_NUMBER>;`` the new value for the sensor.
 - ``return NAN;`` if the state should be considered invalid to indicate an error (advanced).
 - ``return {};`` if you don't want to publish a new state (advanced).

Configuration variables:
------------------------

- **lambda** (*Optional*, :ref:`lambda <config-lambda>`):
  Lambda to be evaluated every update interval to get the new value of the sensor
- **update_interval** (*Optional*, :ref:`config-time`): The interval to check the
  sensor. Set to ``never`` to disable updates. Defaults to ``60s``.
- All other options from :ref:`Sensor <config-sensor>`.

.. _sensor-template-publish_action:

``sensor.template.publish`` Action
----------------------------------

You can also publish a state to a template sensor from elsewhere in your YAML file
with the ``sensor.template.publish`` action.

.. code-block:: yaml

    # Example configuration entry
    sensor:
      - platform: template
        name: "Template Sensor"
        id: template_sens

    # in some trigger
    on_...:
      - sensor.template.publish:
          id: template_sens
          state: 42.0

      # Templated
      - sensor.template.publish:
          id: template_sens
          state: !lambda 'return 42.0;'

Configuration options:

- **id** (**Required**, :ref:`config-id`): The ID of the template sensor.
- **state** (**Required**, float, :ref:`templatable <config-templatable>`):
  The state to publish.

.. note::

    This action can also be written in lambdas:

    .. code-block:: cpp

        id(template_sens).publish_state(42.0);

See Also
--------

- :ref:`sensor-filters`
- :ref:`automation`
- :apiref:`template/sensor/template_sensor.h`
- :ghedit:`Edit`
