---
description: "Instructions for setting up Over-The-Air (OTA) updates for ESPs to download firmwares remotely by HTTP."
title: "OTA Update via HTTP Request"
params:
  seo:
    description: Instructions for setting up Over-The-Air (OTA) updates for ESPs to download firmwares remotely by HTTP.
    image: system-update.svg
---

The OTA (Over The Air) via HTTP Request update component allows your devices to install updated firmware on their own.
To use it, in your device's configuration, you specify a URL from which the device will download the binary
file (firmware). To trigger the update, an ESPHome [action](/automations/actions#all-actions) is used which initiates the
download and installation of the new firmware. Once complete, the device is rebooted, invoking the new firmware.

Since the device functions as an HTTP(S) client, it can be on a foreign network or behind a firewall. This mechanism
is primarily useful with either standalone or MQTT-only devices.

To use this platform, the {{< docref "http_request/" >}} component must be present in your configuration.

```yaml
# Example configuration entry
ota:
  - platform: http_request
```

## Configuration variables

- All [automations](/automations) supported by {{< docref "/components/ota" >}}.

{{< anchor "ota_http_request-flash_action" >}}

## `ota.http_request.flash` Action

This action triggers the download and installation of the updated firmware from the configured URL. As it's an
ESPHome [action](/automations/actions#all-actions), it may be used in any ESPHome [automation(s)](/automations).

```yaml
on_...:
  then:
    - ota.http_request.flash:
        md5_url: http://example.com/firmware.md5
        url: https://example.com/firmware.ota.bin
    - logger.log: "This message should be not displayed because the device reboots"

# Example with HMAC-MD5 verification
on_...:
  then:
    - ota.http_request.flash:
        hmac_md5_url: http://example.com/firmware.hmac
        hmac_key: "my_secret_key"
        url: https://example.com/firmware.ota.bin
```

### Configuration variables

- **md5** (*Optional*, string, [templatable](/automations/templates)): The
  [MD5sum](https://en.wikipedia.org/wiki/Md5sum) of the firmware file pointed to by `url` (below). May not be used
  with `md5_url`, `hmac_md5`, or `hmac_md5_url`; must be specified if none of the other hash options are provided.

- **md5_url** (*Optional*, string, [templatable](/automations/templates)): The URL of the file containing an
  [MD5sum](https://en.wikipedia.org/wiki/Md5sum) of the firmware file pointed to by `url` (below). May not be used
  with `md5`, `hmac_md5`, or `hmac_md5_url`; must be specified if none of the other hash options are provided.

- **hmac_md5** (*Optional*, string, [templatable](/automations/templates)): The
  [HMAC-MD5](https://en.wikipedia.org/wiki/HMAC) hash of the firmware file pointed to by `url` (below). Requires
  `hmac_key` to be specified. May not be used with `md5`, `md5_url`, or `hmac_md5_url`.

- **hmac_md5_url** (*Optional*, string, [templatable](/automations/templates)): The URL of the file containing an
  [HMAC-MD5](https://en.wikipedia.org/wiki/HMAC) hash of the firmware file pointed to by `url` (below). Requires
  `hmac_key` to be specified. May not be used with `md5`, `md5_url`, or `hmac_md5`.

- **hmac_key** (*Optional*, string, [templatable](/automations/templates)): The secret key used for HMAC-MD5
  verification. Required when using `hmac_md5` or `hmac_md5_url`.

- **url** (**Required**, string, [templatable](/automations/templates)): The URL of the binary file containing the
  (new) firmware to be installed.

- **username** (*Optional*, string, [templatable](/automations/templates)): The username to use for HTTP basic
  authentication.

- **password** (*Optional*, string, [templatable](/automations/templates)): The password to use for HTTP basic
  authentication.

> [!NOTE]
>
> - You can obtain the `firmware.ota.bin` file from either:
>
>   - **ESPHome dashboard** (HA add-on): download in *"OTA format"* (formerly "legacy format")
>   - **ESPHome CLI**: the directory `.esphome/build/project/.pioenvs/project/firmware.ota.bin`
>
>     ...where *"project"* is the name of your ESPHome device/project.
>
>   You **cannot** use `firmware.factory.bin` or *"Factory format"* (formerly "Modern format") with this component.
>
> - `username` and `password` must be [URL-encoded](https://en.wikipedia.org/wiki/Percent-encoding) if they
>   include special characters.
>
> - The [MD5sum](https://en.wikipedia.org/wiki/Md5sum) of the firmware binary file is an ASCII file (also known
>   as "plain text", typically found in files with a `.txt` extension) consisting of 32 lowercase hexadecimal
>   characters. It can be obtained and saved to a file with the following command(s):
>
>   - On macOS:
>
> ```shell
>         md5 -q firmware.ota.bin > firmware.md5
> ```
>
> - On most Linux distributions:
>
> ```shell
>         md5sum firmware.ota.bin > firmware.md5
> ```
>
> - On Windows/PowerShell:
>
> ```shell
>         (Get-FileHash -Path firmware.ota.bin -Algorithm md5).Hash.ToLower() | Out-File -FilePath firmware.md5 -Encoding ASCII
> ```
>
> This will generate the MD5 hash of the `firmware.ota.bin` file and write the resulting hash value to the
> `firmware.md5` file. The `md5_url` configuration variable should point to this file on the web server.
> It is used by the OTA updating mechanism to ensure the integrity of the (new) firmware as it is installed.
>
> - The [HMAC-MD5](https://en.wikipedia.org/wiki/HMAC) hash provides enhanced security by using a secret key.
>   It can be generated with the following command(s):
>
>   - On macOS and most Linux distributions with OpenSSL:
>
> ```shell
>         openssl dgst -md5 -hmac "your_secret_key" firmware.ota.bin | cut -d' ' -f2 > firmware.hmac
> ```
>
> - On systems with Python:
>
> ```shell
>         python3 -c "import hmac, hashlib; print(hmac.new(b'your_secret_key', open('firmware.ota.bin', 'rb').read(), hashlib.md5).hexdigest())" > firmware.hmac
> ```
>
> Replace `"your_secret_key"` with the same key specified in the `hmac_key` configuration variable.
> The `hmac_md5_url` configuration variable should point to this file on the web server.
>
> **If, for any reason, the MD5sum or HMAC-MD5 provided does not match the computed hash as the firmware is installed, the
> device will continue to use the original firmware and the new firmware is discarded.**

## See Also

- {{< apiref "ota/ota_component.h" "ota/ota_component.h" >}}
- {{< docref "/components/ota" >}}
- {{< docref "/components/ota/esphome" >}}
- {{< docref "/components/safe_mode" >}}
