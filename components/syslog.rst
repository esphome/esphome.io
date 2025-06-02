Syslog Component
================

.. seo::
    :description: Instructions for setting up a syslog component in ESPHome

The ``syslog`` component can be used to send ESPHome logs to a `syslog server <https://en.wikipedia.org/wiki/Syslog>`_.
It requires both a :doc:`UDP component <udp>` and a :doc:`Time component <time/index>` to be configured.

.. code-block:: yaml

    # Example configuration entry

    udp:
      addresses: 10.0.0.1

    time:
      platform: sntp

    syslog:



Configuration Options
---------------------

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.
- **udp_id** (**Required**, :ref:`config-id`): The ID of the UDP client to use for sending logs. May be omitted if only one UDP client is configured.
- **time_id** (**Required**, :ref:`config-id`): The ID of the time client to use for time-stamping logs. May be omitted if only one time client is configured.
- **port** (*Optional*, int): The port to send logs to. Defaults to ``514``.
- **facility** (*Optional*, int): The syslog facility to use. Defaults to ``16`` (corresponding to ``local0``).
- **level** (*Optional*, string): The highest log level to send to the syslog server. Defaults to ``DEBUG``.
- **strip** (*Optional*, boolean): If set, remove color-codes from log messages. Defaults to ``true``.
