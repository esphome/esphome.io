UART Button
===========

.. seo::
    :description: Instructions for setting up UART buttons in ESPHome that can output arbitrary UART sequences when activated.
    :image: uart.svg

The ``uart`` button platform allows you to send a pre-defined sequence of bytes on a
:doc:`UART bus </components/uart>` when triggered.

.. code-block:: yaml

    # Example configuration entry
    button:
      - platform: uart
        name: "UART String Output"
        data: 'DataToSend'
      - platform: uart
        name: "UART Bytes Output"
        data: [0xDE, 0xAD, 0xBE, 0xEF]

Configuration variables:
------------------------

- **data** (**Required**, string or list of bytes): The data to send via UART. Either an ASCII string
  or a list of bytes.
- **uart_id** (*Optional*, :ref:`config-id`): Manually specify the ID of the UART hub.
- All other options from :ref:`Button <config-button>`.

See Also
--------

- :doc:`/components/uart`
- :apiref:`uart/button/uart_button.h`
- :ghedit:`Edit`
