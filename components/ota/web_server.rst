Web Server OTA Updates
======================

.. seo::
    :description: Instructions for setting up Over-The-Air (OTA) updates via the ESPHome web interface.
    :image: system-update.svg

.. _config-ota_web_server:

The Web Server OTA platform allows you to upload new firmware binaries to your ESPHome devices directly through the 
web interface. This provides a user-friendly way to update devices without needing command-line tools or the ESPHome 
dashboard.

When enabled, an "OTA Update" section appears on the device's web interface where you can select and upload a 
firmware file. This is particularly useful for devices that are deployed in the field or when you want to allow 
non-technical users to perform updates.

.. warning::

    Enabling OTA updates through the web interface without authentication allows anyone with network access to your 
    device to upload new firmware. It is **strongly recommended** to enable authentication on the web server when 
    using this feature.

.. code-block:: yaml

    # Example configuration entry
    web_server:
      port: 80
      auth:
        username: !secret web_server_username
        password: !secret web_server_password

    ota:
      - platform: web_server

Configuration variables:
------------------------

- **id** (*Optional*, :ref:`config-id`): Manually specify the ID used for code generation.
- All :ref:`automations <automation>` supported by :doc:`/components/ota/index`.

.. note::

    This platform requires the :doc:`/components/web_server` component to be configured in your device.

Migration from Legacy Configuration
-----------------------------------

Prior to ESPHome 2025.7.0, OTA functionality was built into the ``web_server`` component using the ``ota`` option. 
This has been moved to a separate platform for consistency with other OTA methods.

**Old configuration:**

.. code-block:: yaml

    web_server:
      port: 80
      ota: true  # or ota: false to disable

**New configuration:**

.. code-block:: yaml

    web_server:
      port: 80

    ota:
      - platform: web_server  # Add this to enable web OTA

If you previously had ``ota: false`` in your web_server configuration, simply remove that line and don't add the 
web_server OTA platform.

Example Configurations
----------------------

Basic setup with web server OTA:

.. code-block:: yaml

    # Basic configuration
    web_server:
      port: 80

    ota:
      - platform: web_server

Secure setup with authentication:

.. code-block:: yaml

    # Recommended: with authentication
    web_server:
      port: 80
      auth:
        username: admin
        password: !secret web_password

    ota:
      - platform: web_server


Using the Web Interface
-----------------------

1. Navigate to your device's web interface at ``http://<device-ip>/`` or ``http://<device-name>.local/``
2. If authentication is enabled, enter your username and password
3. Scroll down to the "OTA Update" section
4. Click "Choose File" and select your firmware file (``firmware.bin``)
5. Click "Update" to start the upload
6. Wait for the upload to complete - the device will automatically reboot with the new firmware

.. warning::

    - Always use ``firmware.bin`` or ``firmware.ota.bin`` files for OTA updates, not ``firmware.factory.bin`` files
    - The web interface may become unresponsive during the update process - this is normal
    - Do not power off the device during an update

See Also
--------

- :apiref:`ota/ota_component.h`
- :doc:`/components/ota/index`
- :doc:`/components/ota/esphome`
- :doc:`/components/web_server`
- :doc:`/components/safe_mode`
- :ghedit:`Edit`
