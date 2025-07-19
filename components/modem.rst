Modem Component
===============

.. seo::
    :description: Instructions for setting up the Ethernet configuration for your ESP32 node in ESPHome.
    :image: ethernet.svg
    :keywords: Network, Modem

This ESPHome component enables cellular modem TCP/IP connections for ESP32s.

Only ESP32 with IDF framework is supported.

As the device IP will be on a foreign private network, :doc:`/components/mqtt` should be used, or :doc:`/components/api` with :doc:`/components/wireguard`. 

This component can't be used with the :doc:`/components/wifi` or the :doc:`/components/ethernet`, even if other are physically available.

.. code-block:: yaml

    modem:
      id: atmodem
      rx_pin: GPIO26
      tx_pin: GPIO27
      model: SIM7600  
      apn: orange
      pin_code: "0000"


Configuration variables:
------------------------

- **model** (**Required**, string): The type of the modem.

  Supported modems are:

  - ``BG96``
  - ``SIM800``
  - ``SIM7000``
  - ``SIM7600``
  - ``SIM7670``
  - ``GENERIC``

- **rx_pin** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The pin used for ``RX`` on the esp side (connected to the ``TX`` pin on the modem side).
- **tx_pin** (**Required**, :ref:`Pin Schema <config-pin_schema>`): The pin used for ``TX`` on the esp side (connected to the ``RX`` pin on the modem side).
- **apn** (**Required**, string): Operator apn.
- **pin_code** (*Optional*, string): The pin code of the sim card.
- **enable_cmux** (*Optional*, boolean): If enabled, CMUX will be enabled. In this mode, the modem will be able to answer `AT` commands while connected. Defaults to ``false``.
- **reboot_timeout** (*Optional*, :ref:`config-time`): The amount of time to wait before rebooting after connecting attempt fail. Defaults to ``10min``.
- **init_at** (*Optional*, list): A list of ``AT`` commands that will be sent to the modem after the connection.
- **power_pin** (*Optional*, :ref:`Pin Schema <config-pin_schema>`): The pin used for ``PWK``, to allow power handling. Needs ``status_pin``.
- **status_pin** (*Optional*, :ref:`Pin Schema <config-pin_schema>`): The pin used for ``STATUS``, to be able to know the power state.
- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.

Advanced options:

- **baud_rate** (*Optional*, int): Modem baud rate. Use ``AT+IPR=?`` with ``init_at:`` to see available baud rate for your modem.
- **enable_on_boot** (*Optional*, boolean): If enabled, the PPPoS interface will be enabled on boot. Defaults to ``true``.
- **ton_pulse_delay** (*Optional*, :ref:`config-time`): Required if using GENERIC model and a power pin, or to override defaults. Must match the hardware specifications.
- **ton_delay** (*Optional*, :ref:`config-time`): Required if using GENERIC model and a power pin, or to override defaults. Must match the hardware specifications.
- **toff_pulse_delay** (*Optional*, :ref:`config-time`): Required if using GENERIC model and a power pin, or to override defaults. Must match the hardware specifications.
- **toff_delay** (*Optional*, :ref:`config-time`): Required if using GENERIC model and a power pin, or to override defaults. Must match the hardware specifications.
- **tx_buffer_size** (*Optionnal*, int): tx buffer size, default 512
- **rx_buffer_size** (*Optionnal*, int): rx buffer size, default 512
- **dte_buffer_size** (*Optionnal*, int): dte buffer size, default 512. May be increased if "CMUX: Failed to defragment longer payload" warning message is raised too often.


Automations:

- **on_not_responding** (*Optional*, :ref:`Automation <automation>`): An action to be performed when the modem doesn't respond.
- **on_connect** (*Optional*, :ref:`Automation <automation>`): An action to be performed when the modem get an IP.
- **on_disconnect** (*Optional*, :ref:`Automation <automation>`): An action to be performed when the modem lost it's IP.


.. note::

    **Lilygo devices**

    On some modem like Lilygo devices, the ``power_pin`` is inverted. Some modem needs also the ``fligth_pin`` to be high.

    .. code-block:: yaml

        modem:
          power_pin: 
            number: GPIO04
            inverted: True

        switch:
          id: flight_mode
          internal: True
          pin: GPIO25
          restore_mode: ALWAYS_ON

.. note::

    **Watchdog timeout**
    
    The modem component tries to locally increase the timeout for the watchdog, to avoid it to trigger during long operations.
    If you have issues with the watchdog, you can try to globaly increase it with the following configuration:
    
    .. code-block:: yaml

        esp32:
          framework:
            type: esp-idf
            sdkconfig_options:
              CONFIG_ESP_TASK_WDT_TIMEOUT_S: "20"  # 20 seconds for task watchdog              



Configuration examples
----------------------

.. code-block:: yaml

    modem:
      id: atmodem
      rx_pin: 26
      tx_pin: 27
      model: SIM7600  
      apn: orange
      status_pin: GPIO34
      power_pin: 
        number: GPIO04
        inverted: True
      pin_code: "0000"
      enable_on_boot: True
      init_at:
        - AT+CGMM  # module name
      on_not_responding:
        - logger.log: "modem not responding"
      on_connect:
        - logger.log: "modem got IP"
      on_disconnect:
        - logger.log: "modem lost IP"

Lambda calls
------------

From :ref:`lambdas <config-lambda>`, you can call several methods to do some advanced stuff.

- ``.send_at(std::string cmd)``: Shortand to ``.dce->at()`` that directly returns an ``modem::AtCommandResult`` containing the satus and the result string.

.. code-block:: cpp

    modem::AtCommandResult result = id(atmodem).send_at("AT+CGMR");
    if(result) {
     ESP_LOGI("main", "Firmware version: %s", result.c_str());
    } else {
     ESP_LOGE("main", "Firmware version error: %s", result.esp_modem_command_result == esp_modem::command_result::FAIL ? "FAIL": "TIMEOUT");
    }

- ``.is_connected()``: Returns ``True`` or ``False`` if the modem is connected or not.

.. code-block:: yaml

    on_...:
      if:
        condition:
          lambda: return id(atmodem).is_connected();
        then:
          - logger.log: Modem is connected!

- ``.enable()``: Enable and start the connection. Poweron the modem if needed and ``power_pin`` defined.
- ``.disable()``: Disconnect. Poweroff the modem if ``power_pin`` defined, or activate ligth sleep.
- ``.reset()``: power cycle the modem if ``power_pin`` defined.
- ``.dce``: The DCE object from the underlying `esp_modem`_ library. See `DCE methods <https://docs.espressif.com/projects/esp-protocols/esp_modem/docs/latest/cxx_api_docs.html#modem-commands>`_ for available commands.

The ``dce`` can be a nullptr, so it must be checked before using it. Use with caution, as can improper use of some methods can brake the modem component.

For example, to get internal modem voltage:

.. code-block:: cpp

    int voltage,bcs,bcl;
    ESP_LOGI("main", "get modem voltage");
    if(id(atmodem).dce) {
      esp_modem::command_result err = id(atmodem).dce->get_battery_status(voltage, bcs, bcl);
      switch (err) {
        case esp_modem::command_result::FAIL:
          ESP_LOGE("main", "get_battery_status FAIL");
          break;
        case esp_modem::command_result::OK:
          ESP_LOGI("main", "get_battery_status OK: %d", volatge);;
          break;
        case esp_modem::command_result::TIMEOUT:
          ESP_LOGE("main", "get_battery_status TIMEOUT");
      }
    } else {
      ESP_LOGE("main", "DCE not available");
    }


Performance and stability
-------------------------

  To gain more speed, or if big transferts fails you can try to enable ``CONFIG_UART_ISR_IN_IRAM``:

  .. code-block:: yaml

      esp32:
      framework:
        type: esp-idf
        sdkconfig_options:
          # To gain more speed, or if big transferts fails
          # not done by default because it conflicts with the uart component (crash)
          CONFIG_UART_ISR_IN_IRAM: y
          # Some command may block for a long delay if the modem is not reachable, and cause a watchdog timeout
          CONFIG_ESP_TASK_WDT_TIMEOUT_S: "60" # 60 is the
          # ith CMUX, do not reconstruct the entire payload in the DTE buffer.
          # Try it if you get "CMUX: Failed to defragment longer payload" warnings message
          # You can also this a bigger "buffer_size_dte"
          CONFIG_ESP_MODEM_CMUX_DEFRAGMENT_PAYLOAD: n
          CONFIG_ESP_MODEM_USE_INFLATABLE_BUFFER_IF_NEEDED: y
          CONFIG_ESP_MODEM_CMUX_USE_SHORT_PAYLOADS_ONLY: n



  

See Also
--------

- :doc:`network`
- :doc:`/components/text_sensor/modem`
- :doc:`/components/sensor/modem`
- :doc:`/components/switch/modem`
- :doc:`/components/mqtt`
- :doc:`/components/wireguard`
- `SIM7600 AT command list <https://simcom.ee/documents/SIM7600C/SIM7500_SIM7600%20Series_AT%20Command%20Manual_V1.01.pdf>`__
- `SIM7600 Hardware design <https://simcom.ee/documents/SIM7600E/SIM7600%20Series%20Hardware%20Design_V1.03.pdf>`__
- `esp modem <https://docs.espressif.com/projects/esp-protocols/esp_modem/docs/latest/index.html>`__
- :ghedit:`Edit`


.. _esp_modem: https://docs.espressif.com/projects/esp-protocols/esp_modem/docs/latest/
