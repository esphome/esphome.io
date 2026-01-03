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
Disabling `reboot_timeout` is recommended because from ESPHome perspective this just means quitting the executable and not rebooting the system.
On a final deployment, setting `level: INFO` would suffice to reduce output chatter.

## Read some data at start

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

## Text sensors

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

## Sensors

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
      auto load_str = result.stdout_output;
      load_str.erase(std::remove_if(load_str.begin(), load_str.end(), ::isspace), load_str.end());
      auto parsed = parse_number<float>(load_str);
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
      auto load_str = result.stdout_output;
      load_str.erase(std::remove_if(load_str.begin(), load_str.end(), ::isspace), load_str.end());
      auto parsed = parse_number<float>(load_str);
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
      auto load_str = result.stdout_output;
      load_str.erase(std::remove_if(load_str.begin(), load_str.end(), ::isspace), load_str.end());
      auto parsed = parse_number<float>(load_str);
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
    icon: mdi:harddisk
    lambda: |-
      auto result = esphome::host::execute_shell_command("df -P / | awk 'NR==2{u=substr($5,1,length($5)-1); print 100-u}'");
      auto load_str = result.stdout_output;
      load_str.erase(std::remove_if(load_str.begin(), load_str.end(), ::isspace), load_str.end());
      auto parsed = parse_number<float>(load_str);
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
      auto load_str = result.stdout_output;
      load_str.erase(std::remove_if(load_str.begin(), load_str.end(), ::isspace), load_str.end());
      auto parsed = parse_number<float>(load_str);
      if (!parsed.has_value()) {
        return NAN;
      }
      return parsed.value();
  - platform: uptime
    name: "Uptime"
    type: seconds
```

Note the usage of `LC_NUMERIC=C` environment variable in the Free memory sensor. This is to ensure that the shell produces numeric output
with proper locales, here specifically we care about decimal separator to be a `.`, not `,` as it is in many other languages.

## Controls

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
              auto load_str = result.stdout_output;
              load_str.erase(std::remove_if(load_str.begin(), load_str.end(), ::isspace), load_str.end());
              auto parsed = parse_on_off(load_str.c_str(), "On", "Off");
              if (parsed == esphome::PARSE_ON) {
                return true;
              }
              if (parsed == esphome::PARSE_OFF) {
                return false;
              }
              ESP_LOGW("host.shell", "Unable to parse monitor state from output: %s", load_str.c_str());
              return {};
```

The template switch, in order to update its state has to rely on a less frequent timing than its built-in lambda which runs every loop cycle.
For this, we use the `interval` component to set a timing which doesn't overload the system.

## See Also

- {{< docref "/components/host" >}}
- {{< docref "esphome/" >}}
