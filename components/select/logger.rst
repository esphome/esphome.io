Logger Select
=============

.. seo::
    :description: Instructions for setting up a logger select in ESPHome.
    :image: description.svg

The ``logger`` Select platform allows you to create a Select that can be used to change the log level of the logger component.

.. code-block:: yaml

    # Example configuration entry
    select:
      - platform: logger
        name: "Logger select"


See Also
--------

- :ref:`automation`
- :doc:`/components/logger`
- :ghedit:`Edit`
