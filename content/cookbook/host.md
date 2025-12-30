---
description: "Recipes for running ESPHome on a Linux host"
title: "Host controls and sensors"
params:
  seo:
    description: Recipes for running ESPHome on a Linux host
---

If you have a Debian system you can run ESPHome binary on it to control a couple of tasks and monitor some states using
`host` platform. Have buttons in Home Assistant to reboot or shut down, switch to turn off and on the screen and sensors to monitor
temperatures, free memory.

It's recommended to set the system up with a static IP address, because ESPHome acts as server and Home Assistant connects to it as client.
Since there's no MDNS advertisment published by the host, you need to add it manually to Home Assistant by the IP address.

## Basic setup

This is all you need to set up a basic ESPHome binary. Do not set a manual MAC address, it's going to use the MAC of the host it's running on.

```yaml
host:

api:
  encryption:
    key: !secret encryption_key

logger:
  level: DEBUG
```

## Read some data at start of binary

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
```

These lamdas run `on_boot` because their result doesn't change anymore after the system boots up.

## Text sensors

The template sensors get updated from the lambdas specified elsewhere in the configuration, thus they are very simple:

```yaml
text_sensor:
  - platform: template
    id: host_model
    icon: mdi:raspberry-pi
    name: "Model"
  - platform: template
    id: host_ip_address
    icon: mdi:ip-network
    name: "IP Addresses"
```

## Sensors

Sensors updating at run time can have their polling command set in their own lambdas:

```yaml
sensor:
  - platform: template
    icon: mdi:radiator
    name: "CPU Temperature"
    state_class: measurement
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
    accuracy_decimals: 2
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
  - platform: uptime
    name: "Uptime"
    type: seconds
```

## Controls

The buttons run the commands directly. 

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

The template switch, in order to update its state has to rely on a less frequent timing than its built-in lambda.
For this, we need to use `interval` to choose a timig which doesn't overload the system to query for the switch state.

## See Also

- {{< docref "/components/host" >}}
- {{< docref "esphome/" >}}
