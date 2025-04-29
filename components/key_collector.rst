.. _key_collector:

Key collector component
=======================

.. seo::
    :description: Key collector component

The ``key_collector`` component collects key presses from components
like :ref:`matrix_keypad`, :doc:`Wiegand keypad </components/wiegand>`
or LVGL :ref:`Button Matrix <lvgl-widget-buttonmatrix>`, :ref:`Keyboard <lvgl-widget-keyboard>`
widgets. It allows you to process key sequences and treat them as one, for
example to allow inputting of a PIN code or a passkey. The component outputs
the result of the keypress sequence as a variable usable in automations.

Component
---------

.. code-block:: yaml

    # Example configuration entry
    key_collector:
      - id: pincode_reader
        source_id: mykeypad
        min_length: 4
        max_length: 4
        end_keys: "#"
        end_key_required: true
        back_keys: "*"
        clear_keys: "C"
        allowed_keys: "0123456789"
        timeout: 5s
        on_progress:
          - logger.log:
              format: "input progress: '%s', started by '%c'"
              args: [ 'x.c_str()', "(start == 0 ? '~' : start)" ]
        on_result:
          - logger.log: 
              format: "input result: '%s', started by '%c', ended by '%c'"
              args: [ 'x.c_str()', "(start == 0 ? '~' : start)", "(end == 0 ? '~' : end)" ]
        on_timeout:
          - logger.log:
              format: "input timeout: '%s', started by '%c'"
              args: [ 'x.c_str()', "(start == 0 ? '~' : start)" ]



Configuration variables:

- **id** (*Optional*, :ref:`config-id`): Set the ID of this entry for use in lambdas.
- **source_id** (*Optional*, :ref:`config-id`): The ID of the key input device.
- **min_length** (*Optional*, integer): The minimal length of the desired key sequence. Below
  this, ``on_result`` automation will not trigger even if any of the ``end_keys`` was pressed.
- **max_length** (*Optional*, integer): The maximum length of the desired key sequence, after 
  which the sequence will trigger the ``on_result`` automation witout having to press any of the ``end_keys``
- **end_keys** (*Optional*, string): Keys used to *enter* the sequence.
- **end_key_required** (*Optional*, boolean): Only trigger ``on_result`` automation when one of
  the ``end_keys`` was pressed. Defaults to ``false``.
- **back_keys** (*Optional*, string): Keys used to delete the last pressed key. Like *Backspace* on a keyboard.
- **clear_keys** (*Optional*, string): Keys used to entirely clear the sequence, all the pressed keys.
- **allowed_keys** (*Optional*, string): Keys allowed to be used. If not specified, then any otherwise 
  unused keys will be allowed.
- **timeout** (*Optional*, :ref:`config-time`): Timeout after which to cancel building the sequence and delete all the keys.

At least one of ``end_keys`` or ``max_length`` have to be specified. The rest are optional.
If both ``end_keys`` and ``max_length`` are specified, then once ``max_length`` keys are collected, no more will be
accepted until an end key is pressed.

Automations:
------------

- **on_progress** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  when keys are pressed. The current sequence of pressed keys is placed in a ``vector<uint8_t>`` variable ``x``
  and ``start`` holds the start key that activated this sequence or else ``0``.
  Useful if you want to have a display showing the current value or number of key presses,
  or a speaker beeping when keys are being pressed.
- **on_result** (*Optional*, :ref:`Automation <automation>`): An automation to perform 
  when the sequence has been finished (eg. ``max_length`` has been reached or one of
  the ``end_keys`` was pressed). The finalized key sequence is placed in a ``vector<uint8_t>`` variable ``x``,
  ``start`` holds the start key that activated this sequence or else ``0``, and
  ``end`` holds the end key that terminated this sequence or else ``0``.
- **on_timeout** (*Optional*, :ref:`Automation <automation>`): An automation to perform
  if the timeout happens. The current sequence of pressed keys is placed in a ``vector<uint8_t>`` variable ``x``
  and ``start`` holds the start key that activated this sequence or else ``0``.

Lambda:
-------

- **send_key(uint8_t key)**: Send a key to the collector directly.

See Also
--------

- :doc:`/components/matrix_keypad`
- :doc:`/components/wiegand`
- :ref:`LVGL Button Matrix widget <lvgl-widget-buttonmatrix>`
- :ref:`LVGL Keyboard widget <lvgl-widget-keyboard>`
- :ghedit:`Edit`
