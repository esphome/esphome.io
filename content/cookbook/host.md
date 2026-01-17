---
description: "Recipes for running ESPHome on a Linux host"
title: "Host controls and sensors"
params:
  seo:
    description: Example for running an ESPHome compiled binary on a Debian host
---

The example config below showcases a Debian system which runs an ESPHome binary to control a couple of tasks and monitor some states using
`host` platform. Exposes buttons in Home Assistant to reboot or shut down, switch to turn off and on the screen and sensors to monitor
CPU temperatures, load average, free memory, disk space, number of available update packages.

It's recommended to set the system up with a static IP address, because ESPHome acts as server and Home Assistant connects to it as client.
Since there's no MDNS advertisment published by the host, you need to add it manually to Home Assistant by the IP address.

The shell commands are executed with the same privileges as the ESPHome binary. It's out of scope of this document to show how to provision
a Linux system in order to properly operate complying to this requirement. You need to set it up so the binary runs automatically after boot.

> [!WARNING]
> This function provides **full, unsandboxed access** to the host operating system. Commands execute with the same
> privileges as the ESPHome process - if running as root, commands have root access. There is no input validation,
> command filtering, or security sandboxing. Only use this on systems you fully control and trust, and never expose
> the API to untrusted networks. Malicious or accidental misuse could result in data loss, system compromise, or
> other serious consequences.
> You should NOT run any commands using this facility that contain data accepted from any outside input (webserver, HA text > sensors etc.)
> unless that data has been well sanitised, since this risks a [command injection attack](https://owasp.org/www-community/attacks/Command_Injection).

## Basic setup

This is all you need to set up a basic ESPHome binary. Do not set a manual MAC address, it's going to use the MAC of the host it's running on.

```yaml
host:

api:
  encryption:
    key: !secret encryption_key
  reboot_timeout: 0s

logger:
  level: DEBUG
```

Disabling `reboot_timeout` is recommended because from ESPHome perspective this just means quitting the executable and not rebooting the whole
system. On a final deployment, setting `level: INFO` would suffice to reduce output chatter.

### Read some data at start

Using `name_add_mac_suffix` will append the last 3 bytes of the mac address of the device to the name, this will allow using the same binary
on multiple machines just by copying it over.

```yaml
esphome:
  name: host-kiosk-pc
  name_add_mac_suffix: true
  on_boot:
    - lambda: |-
        auto result = esphome::host::execute_shell_command("ip -o -4 addr show | awk '$2!=\"lo\"{print $4}' | cut -d/ -f1");
        id(host_ip_address).publish_state(result.stdout_output);
    - lambda: |-
        auto result = esphome::host::execute_shell_command("cat /sys/class/dmi/id/product_name");
        id(host_model).publish_state(result.stdout_output);
    - lambda: |-
        auto result = esphome::host::execute_shell_command("hostname");
        id(host_name).publish_state(result.stdout_output);
    - lambda: |-
        auto result = esphome::host::execute_shell_command("nproc");
        id(host_nproc).publish_state(result.stdout_output);
```

These lamdas run `on_boot` because their result doesn't change anymore after the system boots up, there's no need to run them more than once.

### Text sensors

The template sensors get updated from the lambdas specified elsewhere in the configuration, thus they are very simple:

```yaml
text_sensor:
  - platform: template
    id: host_ip_address
    icon: mdi:ip-network
    name: "IP Addresses"
  - platform: template
    id: host_model
    icon: mdi:raspberry-pi
    name: "Model"
  - platform: template
    id: host_name
    icon: mdi:console-network
    name: "Hostname"
  - platform: template
    id: host_nproc
    icon: mdi:cpu-64-bit
    name: "Cores"
```

### Sensors

Sensors updating at runtime can have their polling command set in their own lambdas, which run in every `update_interval`:

```yaml
sensor:
  - platform: template
    icon: mdi:radiator
    name: "CPU Temperature"
    state_class: measurement
    unit_of_measurement: "°C"
    accuracy_decimals: 0
    lambda: |-
      auto result = esphome::host::execute_shell_command("cat /sys/class/thermal/thermal_zone0/temp");
      auto stdout_str = result.stdout_output;
      stdout_str.erase(std::remove_if(stdout_str.begin(), stdout_str.end(), ::isspace), stdout_str.end());
      auto parsed = parse_number<float>(stdout_str);
      if (!parsed.has_value()) {
        return NAN;
      }
      return parsed.value() / 1000;
  - platform: template
    name: "Load average"
    update_interval: 30s
    state_class: measurement
    accuracy_decimals: 2
    icon: mdi:cpu-64-bit
    lambda: |-
      auto result = esphome::host::execute_shell_command("awk '{print $1}' /proc/loadavg");
      auto stdout_str = result.stdout_output;
      stdout_str.erase(std::remove_if(stdout_str.begin(), stdout_str.end(), ::isspace), stdout_str.end());
      auto parsed = parse_number<float>(stdout_str);
      if (!parsed.has_value()) {
        return NAN;
      }
      return parsed.value();
  - platform: template
    name: "Free memory"
    state_class: measurement
    unit_of_measurement: "%"
    accuracy_decimals: 0
    icon: mdi:memory
    lambda: |-
      esphome::host::ShellCommandOptions opts;
      opts.environment = {
        {"LC_NUMERIC", "C"},
      };
      auto result = esphome::host::execute_shell_command("free | awk '/^Mem:/ {print ($7/$2)*100}'", opts);
      auto stdout_str = result.stdout_output;
      stdout_str.erase(std::remove_if(stdout_str.begin(), stdout_str.end(), ::isspace), stdout_str.end());
      auto parsed = parse_number<float>(stdout_str);
      if (!parsed.has_value()) {
        return NAN;
      }
      return parsed.value();
  - platform: template
    name: "Free disk space on \u005C"
    update_interval: 5min
    state_class: measurement
    unit_of_measurement: "%"
    accuracy_decimals: 0
    icon: mdi:chart-donut
    lambda: |-
      auto result = esphome::host::execute_shell_command("df -P / | awk 'NR==2{u=substr($5,1,length($5)-1); print 100-u}'");
      auto stdout_str = result.stdout_output;
      stdout_str.erase(std::remove_if(stdout_str.begin(), stdout_str.end(), ::isspace), stdout_str.end());
      auto parsed = parse_number<float>(stdout_str);
      if (!parsed.has_value()) {
        return NAN;
      }
      return parsed.value();
  - platform: template
    name: "Package updates available"
    update_interval: 1days
    state_class: measurement
    accuracy_decimals: 0
    icon: mdi:package-down
    lambda: |-
      auto result = esphome::host::execute_shell_command("apt list --upgradable 2>/dev/null | tail -n +2 | wc -l");
      auto stdout_str = result.stdout_output;
      stdout_str.erase(std::remove_if(stdout_str.begin(), stdout_str.end(), ::isspace), stdout_str.end());
      auto parsed = parse_number<float>(stdout_str);
      if (!parsed.has_value()) {
        return NAN;
      }
      return parsed.value();
  - platform: uptime
    name: "Uptime"
    type: seconds
  - platform: template
    id: eno1_rx
    name: "NIC eno1 download"
    state_class: measurement
    device_class: data_rate
    accuracy_decimals: 0
    icon: mdi:download-network-outline
    unit_of_measurement: b/s
  - platform: template
    id: eno1_tx
    name: "NIC eno1 upload"
    state_class: measurement
    device_class: data_rate
    accuracy_decimals: 0
    icon: mdi:upload-network-outline
    unit_of_measurement: b/s
```

Note the usage of `LC_NUMERIC=C` environment variable in the Free memory sensor. This is to ensure that the shell produces numeric output
with proper locales, here specifically we care about decimal separator to be a `.`, not `,` as it is in many other languages.

### Controls

The buttons run the commands directly:

```yaml
button:
  - platform: template
    name: "Reboot"
    icon: mdi:restart
    on_press:
      - lambda: |-
          auto result = esphome::host::execute_shell_command("/sbin/reboot");
  - platform: template
    name: "Shutdown"
    icon: mdi:power-cycle
    disabled_by_default: true
    on_press:
      - lambda: |-
          auto result = esphome::host::execute_shell_command("/sbin/shutdown -h now");

switch:
  - platform: template
    name: "Display"
    id: host_display_switch
    icon: mdi:monitor-shimmer
    optimistic: true
    restore_mode: DISABLED # or ALWAYS_ON
    turn_on_action:
      - lambda: |-
          esphome::host::ShellCommandOptions opts;
          opts.environment = {
            {"DISPLAY", ":0.0"},
          };
          auto result = esphome::host::execute_shell_command("xset dpms force on", opts);
    turn_off_action:
      - lambda: |-
          esphome::host::ShellCommandOptions opts;
          opts.environment = {
            {"DISPLAY", ":0.0"},
          };
          auto result = esphome::host::execute_shell_command("xset dpms force off", opts);

interval:
  - interval: 5s
    then:
      - switch.template.publish:
          id: host_display_switch
          state: !lambda |-
              esphome::host::ShellCommandOptions opts;
              opts.environment = {
                {"DISPLAY", ":0.0"},
              };
              auto result = esphome::host::execute_shell_command("xset -q | awk '/Monitor is/ {print $NF; exit}'", opts);
              auto stdout_str = result.stdout_output;
              stdout_str.erase(std::remove_if(stdout_str.begin(), stdout_str.end(), ::isspace), stdout_str.end());
              auto parsed = parse_on_off(stdout_str.c_str(), "On", "Off");
              if (parsed == esphome::PARSE_ON) {
                return true;
              }
              if (parsed == esphome::PARSE_OFF) {
                return false;
              }
              ESP_LOGW("host.shell", "Unable to parse monitor state from output: %s", stdout_str.c_str());
              return {};
  - interval: 5min
    then:
      - lambda: |-
          auto rx1_result = esphome::host::execute_shell_command("cat /sys/class/net/eno1/statistics/rx_bytes");
          auto rx1_str = rx1_result.stdout_output;
          rx1_str.erase(std::remove_if(rx1_str.begin(), rx1_str.end(), ::isspace), rx1_str.end());
          id(eno1_rx1) = parse_number<uint64_t>(rx1_str).value_or(0);
      - lambda: |-
          auto tx1_result = esphome::host::execute_shell_command("cat /sys/class/net/eno1/statistics/tx_bytes");
          auto tx1_str = tx1_result.stdout_output;
          tx1_str.erase(std::remove_if(tx1_str.begin(), tx1_str.end(), ::isspace), tx1_str.end());
          id(eno1_tx1) = parse_number<uint64_t>(tx1_str).value_or(0);
      - delay: 1s
      - lambda: |-
          auto rx2_result = esphome::host::execute_shell_command("cat /sys/class/net/eno1/statistics/rx_bytes");
          auto rx2_str = rx2_result.stdout_output;
          rx2_str.erase(std::remove_if(rx2_str.begin(), rx2_str.end(), ::isspace), rx2_str.end());
          id(eno1_rx2) = parse_number<uint64_t>(rx2_str).value_or(0);
      - lambda: |-
          auto tx2_result = esphome::host::execute_shell_command("cat /sys/class/net/eno1/statistics/tx_bytes");
          auto tx2_str = tx2_result.stdout_output;
          tx2_str.erase(std::remove_if(tx2_str.begin(), tx2_str.end(), ::isspace), tx2_str.end());
          id(eno1_tx2) = parse_number<uint64_t>(tx2_str).value_or(0);
      - lambda: |-
          id(eno1_rx).publish_state((float)(id(eno1_rx2) - id(eno1_rx1)));
          id(eno1_tx).publish_state((float)(id(eno1_tx2) - id(eno1_tx1)));

globals:
  - id: eno1_rx1
    type: uint64_t
  - id: eno1_tx1
    type: uint64_t
  - id: eno1_rx2
    type: uint64_t
  - id: eno1_tx2
    type: uint64_t
```

The template switch, in order to update its state has to rely on a less frequent timing than its built-in lambda which runs every loop cycle.
For this, we use the `interval` component to set a timing which doesn't overload the system.

For network traffic measurement, every 5 minutes we look two times at the linux traffic statistic counters with one second delay, substract
them and publish them to the template sensors. We use `globals` to define variables available between the different lambdas.

## Deploy as systemd unit

To deploy it as a systemd unit which ensures proper startup at boot, and restarts the binary in case of failure we can assume something like:

- **User:** `kiosk` (with appropriate privileges to run the commands defined in the yaml)
- **Binary location:** `/usr/local/bin/esphome_host`
- **Preferences location:** `/var/lib/esphome_host` (in the yaml, set `preferences_path: /var/lib/esphome_host`)

### Place the binary and create directories

Compile the binary using `esphome run` and watch the log for the message "Running program from path". Usse that path in the following command:

```bash
# Recommended location for the binary
sudo install -m 0755 <compilation_output_path> /usr/local/bin/esphome_host

# Create the dedicated working directory to save the preferences file
sudo install -d -o kiosk -g kiosk -m 0750 /var/lib/esphome_host
```

### Create the systemd unit

```bash
sudo nano /etc/systemd/system/esphome_host.service
```

with the following content:

```ini
[Unit]
Description=ESPHome Host Service
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=kiosk
Group=kiosk
WorkingDirectory=/var/lib/esphome_host
ExecStart=/usr/local/bin/esphome_host
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=default.target
```

### Enable and start

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now esphome_host.service
sudo systemctl status esphome_host.service
```

To see the log, use:

```bash
journalctl -u esphome_host.service
```

## See Also

- {{< docref "/components/host" >}}
- {{< docref "esphome/" >}}
