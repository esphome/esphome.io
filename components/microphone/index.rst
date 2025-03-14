Microphone Components
=====================

.. seo::
    :description: Instructions for setting up microphones in ESPHome.
    :image: folder-open.svg

The ``microphone`` domain contains common functionality shared across the
microphone platforms.

.. _config-microphone:

Base Microphone Configuration
-----------------------------

Configuration variables:

- **on_data** (*Optional*, :ref:`Automation <automation>`): An automation to
  perform when new data is received.

.. _microphone-actions:

Microphone Actions
------------------

All ``microphone`` actions can be used without specifying an ``id`` if you have only one ``microphone`` in
your configuration YAML.

Configuration variables:

**id** (*Optional*, :ref:`config-id`): The microphone to control. Defaults to the only one in YAML.


.. _microphone-capture:

``microphone.capture`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will start capturing audio data from the microphone. The data will be passed to any components listening
and will be available in the ``on_data`` trigger.

.. _microphone-stop_capture:

``microphone.stop_capture`` Action
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This action will stop capturing audio data from the microphone.


.. _microphone-triggers:

Microphone Triggers
-------------------

.. _microphone-on_data:

``microphone.on_data`` Trigger
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This trigger will fire when new data is received from the microphone.
The data is available as a ``std::vector<int16_t>`` in the variable ``x``.

.. code-block:: yaml

    microphone:
      - platform: ...
        on_data:
          - logger.log:
              format: "Received %d bytes"
              args: ['x.size()']

Configuration variables:

- **id** (*Optional*, :ref:`config-id`): The microphone to check. Defaults to the only one in YAML.


.. _microphone-conditions:

Microphone Conditions
---------------------

All ``microphone`` conditions can be used without specifying an ``id`` if you have only one ``microphone`` in
your configuration YAML.

Configuration variables:

**id** (*Optional*, :ref:`config-id`): The microphone to check. Defaults to the only one in YAML.

.. _microphone-is_capturing:

``microphone.is_capturing`` Condition
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This condition will check if the microphone is currently capturing audio data.


Platforms
---------

.. toctree::
    :maxdepth: 1
    :glob:

    *

See Also
--------

- :ghedit:`Edit`
