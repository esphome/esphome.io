Command Line Interface
======================

.. seo::
    :description: Documentation for the command line interface of ESPHome.

Base Usage
----------

ESPHome's command line interface always has the following format

.. code-block:: console

    esphome [OPTIONS] <COMMAND> <CONFIGURATION...> [ARGUMENTS]

.. note::

    You can specify multiple configuration files in the command line interface for some commands,
    just list all files after the <COMMAND> like so:

    .. code-block:: console

        esphome run livingroom.yaml kitchen.yaml

``--help`` Option
--------------------

.. option:: -h|--help

    Output possible <commands> and [arguments].
    Note: you can also use ``--help`` for any command to get arguments specific to that command.
.. code-block:: console

    esphome <some_command> --help

``--verbose`` Option
--------------------

.. option:: -v|--verbose

    Enable verbose esphome logs.
    Can also be enabled via environment variable ``ESPHOME_VERBOSE=true``.

``--quiet`` Option
------------------

.. option:: -q|--quiet

    Disable all esphome logs.

``--substitution`` Option
-------------------------

*(can be issued multiple times)*

.. option:: -s|--substitution KEY VALUE

    Defines or overrides substitution KEY with value VALUE.

Please see :ref:`command line substitutions <command-line-substitutions>` for details.

``run`` Command
---------------

The ``esphome run <CONFIG>`` command is the most common command for ESPHome. It

* Validates the configuration
* Compiles a firmware
* Uploads the firmware (over OTA or USB)
* Starts the log view

.. program:: esphome run

.. option:: --device UPLOAD_PORT

    Manually specify the upload port/IP to use. For example ``/dev/cu.SLAB_USBtoUART``, or ``192.168.1.176``
    to perform an OTA.

.. option:: --no-logs

    Disable starting log view.

.. option:: --topic TOPIC

    Manually set the topic to subscribe to for MQTT logs (defaults to the one in the configuration).

.. option:: --username USERNAME

    Manually set the username to subscribe with for MQTT logs (defaults to the one in the configuration).

.. option:: --password PASSWORD

    Manually set the password to subscribe with for MQTT logs (defaults to the one in the configuration).

.. option:: --client-id CLIENT_ID

    Manually set the client ID to subscribe with for MQTT logs (defaults to a randomly chosen one).

.. option:: --host-port HOST_PORT

    Specify the host port to use for legacy Over the Air uploads.

``config`` Command
------------------

.. program:: esphome config

The ``esphome config <CONFIG>`` validates the configuration and displays the validation result.


``compile`` Command
-------------------

.. program:: esphome compile

The ``esphome compile <CONFIG>`` validates the configuration and compiles the firmware.

.. option:: --only-generate

    If set, only generates the C++ source code and does not compile the firmware.

``upload`` Command
------------------

.. program:: esphome upload

The ``esphome upload <CONFIG>`` validates the configuration and uploads the most recent firmware build.

.. option:: --device UPLOAD_PORT

    Manually specify the upload port/IP address to use. For example ``/dev/cu.SLAB_USBtoUART``, or ``192.168.1.176``
    to perform an OTA.

.. option:: --host-port HOST_PORT

    Specify the host port to use for legacy Over the Air uploads.

``clean-mqtt`` Command
----------------------

.. program:: esphome clean-mqtt

The ``esphome clean-mqtt <CONFIG>`` cleans retained MQTT discovery messages from the MQTT broker.
See :ref:`mqtt-using_with_home_assistant_entities`.

.. option:: --topic TOPIC

    Manually set the topic to clean retained messages from (defaults to the MQTT discovery topic of the
    node).

.. option:: --username USERNAME

    Manually set the username to subscribe with.

.. option:: --password PASSWORD

    Manually set the password to subscribe with.

.. option:: --client-id CLIENT_ID

    Manually set the client ID to subscribe with.

``wizard`` Command
------------------

.. program:: esphome wizard

The ``esphome wizard <CONFIG>`` command starts the ESPHome configuration creation wizard.

``mqtt-fingerprint`` Command
----------------------------

.. program:: esphome mqtt-fingerprint

The ``esphome mqtt-fingerprint <CONFIG>`` command shows the MQTT SSL fingerprints of the remote used
for SSL MQTT connections. See :ref:`mqtt-ssl_fingerprints`.

``version`` Command
-------------------

.. program:: esphome version

The ``esphome version`` command shows the current ESPHome version and exits.

``clean`` Command
-----------------

.. program:: esphome clean

The ``esphome clean <CONFIG>`` command cleans all build files and can help with some build issues.

``dashboard`` Command
---------------------

.. program:: esphome dashboard

The ``esphome dashboard <CONFIG>`` command starts the ESPHome dashboard server for using ESPHome
through a graphical user interface. This command accepts a configuration directory instead of a
single configuration file.

.. option:: --address ADDRESS

    Manually set the address to bind to (defaults to 0.0.0.0)

.. option:: --port PORT

    Manually set the HTTP port to open connections on (defaults to 6052)

.. option:: --socket SOCKET

    Manually set the unix socket to bind to. If specified along with ``--address`` or ``--port`` the values
    for those parameters will be ignored. Cannot be used along with ``--systemd-socket``.

.. option:: --username USERNAME

    The optional username to require for authentication.

.. option:: --password PASSWORD

    The optional password to require for authentication.

.. option:: --open-ui

    If set, opens the dashboard UI in a browser once the server is up and running. Does not work when using
    ``--socket``.

``logs`` Command
---------------------

.. program:: esphome logs

The ``esphome logs <CONFIG>`` command validates the configuration and shows all logs.

.. option:: --topic TOPIC

    Manually set the topic to subscribe to.

.. option:: --username USERNAME

    Manually set the username.

.. option:: --password PASSWORD

    Manually set the password.

.. option:: --client-id CLIENT_ID

    Manually set the client id.

.. option:: --device SERIAL_PORT

    Manually specify a serial port/IP to use. For example ``/dev/cu.SLAB_USBtoUART``.

Using Bash or ZSH auto-completion
---------------------------------

ESPHome's command line interface provides the ability to use auto-completion features provided by Bash or ZSH.

You can register ESPHome for auto-completion by adding the following to your ~/.bashrc file:

.. code-block:: console

    eval "$(register-python-argcomplete esphome)"

For more information, see `argcomplete <https://kislyuk.github.io/argcomplete/>`__ documentation.

