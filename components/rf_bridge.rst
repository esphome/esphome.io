RF Bridge Component
===================

.. seo::
    :description: Instructions for setting up the RF Bridge in ESPHome.
    :image: rf_bridge.jpg
    :keywords: RF Bridge

The ``RF Bridge`` Component provides the ability to send and receive 433MHz remote codes using the
embedded EFM8BB1 microcontroller. This component implements the communication protocol
that the original ``efm8bb1`` firmware implements. The device is connected via the
:doc:`UART bus </components/uart>`. The uart bus must be configured at the same speed of the module
which is 19200bps.

.. warning::

    If you are using the :doc:`logger` make sure you disable the uart logging with the
    ``baud_rate: 0`` option.

.. figure:: images/rf_bridge-full.jpg
    :align: center
    :width: 60.0%

    Sonoff RF Bridge 433, version R1 or R2 V1.0

.. code-block:: yaml

    # Example configuration entry
    uart:
      baud_rate: 19200

    rf_bridge:
      on_code_received:
        - homeassistant.event:
            event: esphome.rf_code_received
            data:
              sync: !lambda 'return format_hex(data.sync);'
              low: !lambda 'return format_hex(data.low);'
              high: !lambda 'return format_hex(data.high);'
              code: !lambda 'return format_hex(data.code);'

Configuration variables:
------------------------

- **uart_id** (*Optional*, :ref:`config-id`): Manually specify the ID of the UART hub.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.
- **on_code_received** (*Optional*, :ref:`Automation <automation>`): An action to be
  performed when a code is received. See :ref:`rf_bridge-on_code_received`.

.. _rf_bridge-on_code_received:

``on_code_received`` Trigger
----------------------------

With this configuration option you can write complex automations whenever a code is
received. To use the code, use a :ref:`lambda <config-lambda>` template, the code
and the corresponding protocol timings are available inside that lambda under the
variables named ``code``, ``sync``, ``high`` and ``low``.

.. code-block:: yaml

    on_code_received:
      - homeassistant.event:
          event: esphome.rf_code_received
          data:
            sync: !lambda 'return format_hex(data.sync);'
            low: !lambda 'return format_hex(data.low);'
            high: !lambda 'return format_hex(data.high);'
            code: !lambda 'return format_hex(data.code);'


.. _rf_bridge-send_code_action:

``rf_bridge.send_code`` Action
------------------------------

Send an RF code using this action in automations.

.. code-block:: yaml

    on_...:
      then:
        - rf_bridge.send_code:
            sync: 0x700
            low: 0x800
            high: 0x1000
            code: 0xABC123

Configuration options:

- **sync** (**Required**, int, :ref:`templatable <config-templatable>`): RF Sync timing
- **low** (**Required**, int, :ref:`templatable <config-templatable>`): RF Low timing
- **high** (**Required**, int, :ref:`templatable <config-templatable>`): RF high timing
- **code** (**Required**, int, :ref:`templatable <config-templatable>`): RF code
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID of the RF Bridge if you have multiple components.

.. note::

    This action can also be written in :ref:`lambdas <config-lambda>`:

    .. code-block:: cpp

        id(rf_bridge).send_code(0x700, 0x800, 0x1000, 0xABC123);


.. _rf_bridge-send_raw_action:

``rf_bridge.send_raw`` Action
-----------------------------

Send a raw command to the onboard EFM8BB1 chip.
You can see a list of available commands and format in the `Portisch Wiki <https://github.com/Portisch/RF-Bridge-EFM8BB1/wiki/Commands>`__

This can be used to send raw RF codes in automation's, mainly for protocols that are not supported.
If you have *Portisch* firmware installed, these raw codes can be obtained with the help of :ref:`rf_bridge-start_bucket_sniffing_action`

.. code-block:: yaml

    on_...:
      then:
        - rf_bridge.send_raw:
            raw: AAA5070008001000ABC12355

Configuration options:

- **raw** (**Required**, string, :ref:`templatable <config-templatable>`): RF raw string
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID of the RF Bridge if you have multiple components.

.. note::

    This action can also be written in :ref:`lambdas <config-lambda>`:

    .. code-block:: cpp

        id(rf_bridge).send_raw("AAA5070008001000ABC12355");


.. _rf_bridge-learn_action:

``rf_bridge.learn`` Action
--------------------------

Tell the RF Bridge to learn new protocol timings using this action in automations.
A new code with timings will be returned to :ref:`rf_bridge-on_code_received`

.. code-block:: yaml

    on_...:
      then:
        - rf_bridge.learn

Configuration options:

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID of the RF Bridge if you have multiple components.

.. note::

    This action can also be written in :ref:`lambdas <config-lambda>`:

    .. code-block:: cpp

        id(rf_bridge).learn();


Portisch firmware
-----------------

If you have flashed the secondary MCU with the `Portisch firmware <https://github.com/Portisch/RF-Bridge-EFM8BB1>`__,
ESPHome is able to receive the extra protocols that can be decoded as well as activate the other modes supported.


.. _rf_bridge-on_advanced_code_received:

``on_advanced_code_received`` Trigger
*************************************

Similar to :ref:`rf_bridge-on_code_received`, this trigger receives the codes after advanced sniffing is started.
To use the code, use a :ref:`lambda <config-lambda>` template, the code and the corresponding protocol and length
are available inside that lambda under the variables named ``code``, ``protocol`` and ``length``.

.. code-block:: yaml

    on_advanced_code_received:
      - homeassistant.event:
          event: esphome.rf_advanced_code_received
          data:
            length: !lambda 'return format_hex(data.length);'
            protocol: !lambda 'return format_hex(data.protocol);'
            code: !lambda 'return data.code;'


.. _rf_bridge-send_advanced_code_action:

``rf_bridge.send_advanced_code`` Action
***************************************

Send an  RF code using this action in automations.

.. code-block:: yaml

    on_...:
      then:
        - rf_bridge.send_advanced_code:
            length: 0x04
            protocol: 0x01
            code: "ABC123"

Configuration options:

- **length** (**Required**, int, :ref:`templatable <config-templatable>`): Length of code plus protocol
- **protocol** (**Required**, int, :ref:`templatable <config-templatable>`): RF Protocol
- **code** (**Required**, string, :ref:`templatable <config-templatable>`): RF code
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID of the RF Bridge if you have multiple components.

.. note::

    This action can also be written in :ref:`lambdas <config-lambda>`:

    .. code-block:: cpp

        id(rf_bridge).send_advanced_code(0x04, 0x01, "ABC123");


.. _rf_bridge-start_advanced_sniffing_action:

``rf_bridge.start_advanced_sniffing`` Action
********************************************

Tell the RF Bridge to listen for the advanced/extra protocols defined in the portisch firmware.
The decoded codes with length and protocol will be returned to :ref:`rf_bridge-on_advanced_code_received`

.. code-block:: yaml

    on_...:
      then:
        - rf_bridge.start_advanced_sniffing

Configuration options:

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID of the RF Bridge if you have multiple components.

.. note::

    This action can also be written in :ref:`lambdas <config-lambda>`:

    .. code-block:: cpp

        id(rf_bridge).start_advanced_sniffing();


.. _rf_bridge-stop_advanced_sniffing_action:

``rf_bridge.stop_advanced_sniffing`` Action
*******************************************

Tell the RF Bridge to stop listening for the advanced/extra protocols defined in the portisch firmware.

.. code-block:: yaml

    on_...:
      then:
        - rf_bridge.stop_advanced_sniffing

Configuration options:

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID of the RF Bridge if you have multiple components.

.. note::

    This action can also be written in :ref:`lambdas <config-lambda>`:

    .. code-block:: cpp

        id(rf_bridge).stop_advanced_sniffing();

.. _rf_bridge-start_bucket_sniffing_action:

``rf_bridge.start_bucket_sniffing`` Action
******************************************

Tell the RF Bridge to dump raw sniffing data. Useful for getting codes for unsupported protocols.
The raw data will be available in the log and can later be used with :ref:`rf_bridge-send_raw_action` action.

.. note::

    A conversion from *B1* (received) raw format to *B0* (send) raw command format should be applied.
    For this, you can use the tool `BitBucket Converter <https://bbconv.hrbl.pl/>`__

.. note::

    There seems to be an overflow problem in Portisch firmware and after a short while, the bucket sniffing stops.
    You should re-call the action to reset and start sniffing again.

.. code-block:: yaml

    on_...:
      then:
        - rf_bridge.start_bucket_sniffing

Configuration options:

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID of the RF Bridge if you have multiple components.

.. note::

    This action can also be written in :ref:`lambdas <config-lambda>`:

    .. code-block:: cpp

        id(rf_bridge).start_bucket_sniffing();


.. _rf_bridge-beep_action:

``rf_bridge.beep`` Action
*************************

Activate the internal buzzer to make a beep.


.. code-block:: yaml

    on_...:
      then:
        - rf_bridge.beep:
            duration: 100

Configuration options:

- **duration** (**Required**, string, :ref:`templatable <config-templatable>`): beep duration in milliseconds.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID of the RF Bridge if you have multiple components.

.. note::

    This action can also be written in :ref:`lambdas <config-lambda>`:

    .. code-block:: cpp

        id(rf_bridge).beep(100);

Getting started with Home Assistant
-----------------------------------

The following code will get you up and running with a configuration sending codes to
Home Assistant as events and will also setup a service so you can send codes with your RF Bridge.

.. code-block:: yaml

    api:
      actions:
        - action: send_rf_code
          variables:
            sync: int
            low: int
            high: int
            code: int
          then:
            - rf_bridge.send_code:
                sync: !lambda 'return sync;'
                low: !lambda 'return low;'
                high: !lambda 'return high;'
                code: !lambda 'return code;'
        - action: learn
          then:
            - rf_bridge.learn

    uart:
      tx_pin: 1
      rx_pin: 3
      baud_rate: 19200

    logger:
      baud_rate: 0

    rf_bridge:
      on_code_received:
        then:
          - homeassistant.event:
              event: esphome.rf_code_received
              data:
                sync: !lambda 'return format_hex(data.sync);'
                low: !lambda 'return format_hex(data.low);'
                high: !lambda 'return format_hex(data.high);'
                code: !lambda 'return format_hex(data.code);'


Now your latest received code will be in an event.

To trigger the automation from Home Assistant you can invoke the service with this code:

.. code-block:: yaml

    automation:
      # ...
      action:
      - action: esphome.rf_bridge_send_rf_code
        data:
          sync: 0x700
          low: 0x800
          high: 0x1000
          code: 0xABC123

See Also
--------

- :apiref:`rf_bridge/rf_bridge.h`
- :ref:`lambda_magic_rf_queues`
- `RF-Bridge-EFM8BB1 <https://github.com/Portisch/RF-Bridge-EFM8BB1>`__ by `Portisch <https://github.com/Portisch>`__
- :doc:`/components/uart`
- :doc:`/components/remote_receiver`
- :doc:`/components/remote_transmitter`
- :ghedit:`Edit`
