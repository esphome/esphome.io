Prometheus Component
====================

.. seo::
    :description: Instructions for setting up a prometheus exporter with ESPHome.
    :image: prometheus.svg

The ``prometheus`` component enables an HTTP endpoint for the
:doc:`web_server` in order to integrate a `Prometheus <https://prometheus.io/>`__ installation.

This can be used to scrape data directly into your Prometheus-based monitoring and alerting-system,
without the need of any other software.

The list of available metrics can be found by directly browsing your node under
``<ip or node_name.local>/metrics``, and may be increased in the future.

.. code-block:: yaml

    # Example configuration entry
    web_server:

    # Activates prometheus /metrics endpoint
    prometheus:


Configuration variables:
------------------------

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.
- **include_internal** (*Optional*, boolean): Whether ``internal`` entities should be displayed on the
  web interface. Defaults to ``false``.
- **relabel** (*Optional*): Override metric labels. See :ref:`prometheus-relabel`

.. note::

    Example integration into the configuration of your prometheus:

    .. code-block:: yaml

        scrape_configs:
          - job_name: esphome
            static_configs:
              - targets: [<ip or node_name.local>]

Supported ESPHome Components
----------------------------

-  Sensor
-  Binary Sensor
-  Fan
-  Light
-  Cover
-  Switch
-  Lock
-  Text Sensor
-  Number
-  Select
-  Media Player
-  Update
-  Valve
-  Climate

Supported Prometheus Labels
---------------------------

The following labels are supported in all Prometheus metrics. Some metrics may have more labels.

-  entity id
-  entity name
-  entity friendly name
-  area
-  node name

Metric Relabeling
-----------------

ESPHome allows you to do some basic relabeling of Prometheus metrics.
This is useful if you want to have different metric names or IDs than those shown in Home Assistant or the web interface.

You can relabel metric name or ID labels by adding a ``relabel`` block in the ``prometheus`` configuration,
and then adding a block with ``id`` and/or ``name`` fields for each sensor whose labels your want to override.

.. _prometheus-relabel:

``relabel``
***********

Set the ``id`` and ``name`` label values of the Prometheus metric for the sensor with the specified ID.

.. code-block:: yaml

    # Example configuration entry
    prometheus:
      relabel:
        my_voltage_sensor:
          id: angry_pixies
          name: "Angry Pixies"


See Also
--------

- :doc:`/components/web_server`
- :ref:`api-rest`
- :doc:`/components/http_request`
- :apiref:`prometheus/prometheus_handler.h`
- `Prometheus <https://prometheus.io/>`__
- :ghedit:`Edit`
