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

.. note::

    The only selections available will be log levels below the level set in the logger component definition. If not set, the default of DEBUG is used.

See Also
--------

- :ref:`automation`
- :doc:`/components/logger`
- :ghedit:`Edit`
