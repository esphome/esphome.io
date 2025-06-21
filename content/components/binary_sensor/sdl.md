SDL Binary Sensor
=================

.. seo::
    :description: Instructions for setting up an SDL keyboard binary sensor.

The ``sdl`` binary sensor platform creates a binary sensor from keyboard presses on the host platform. 
The sensor will be true when the key is pressed.

Configuration variables:
------------------------

- **key** (**Required**): The ID of an `SDL key <https://www.libsdl.org/release/SDL-1.2.15/docs/html/sdlkey.html>`_.
- All other variables from :ref:`Binary Sensor <config-binary_sensor>`.

Example:

.. code-block:: yaml

    binary_sensor:
      - platform: sdl
        id: key_id
        key: SDLK_a

See Also
--------
- :doc:`Host Platform </components/host>`
- :ref:`SDL display <sdl>`
- :ghedit:`Edit`
