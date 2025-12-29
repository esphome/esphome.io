---
description: "Configuration for the host platform for ESPHome."
title: "Host Platform"
params:
  seo:
    description: Configuration for the host platform for ESPHome.
    image: host.svg
---

The `host` platform allows ESPHome configurations to be compiled and run on a desktop computer. This is known
to work on MacOS and Linux. On Windows [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) (Windows Subsystem for Linux) can be used to create a Linux environment that will run ESPHome.

The only configuration required is to optionally set a dummy MAC address that will be used to identify the
configuration to Home Assistant (the native MAC address is not readily available.)

> [!NOTE]
> HA will not automatically discover an ESPHome instance running on `host` using mDNS, and you will need
> to add it explicitly using the IP address of your host computer. If HA cannot establish a connection when
> adding the device manually, the firewall settings of the local host computer may be the cause. The
> ESPHome *API* port (`6053`) must be allowed through the firewall of your host to accept connections.
> See {{< docref "/components/api" >}} for details.

Many components, especially those interfacing to actual hardware, will not be available when using `host`. Do not
configure wifi or ethernet - network will automatically be available using the host computer.

```yaml
# Example configuration entry
host:
  mac_address: "06:35:69:ab:f6:79"
```

## Configuration variables

- **mac_address** (*Optional*, MAC address): A dummy MAC address to use when communicating with HA.

## Build and run

The `esphome run yourfile.yaml` command will compile and automatically run the build file on the `host` platform.

## Lambda calls

The `execute_shell_command` function can be used in a [lambda](/automations/templates#config-lambda) to run shell commands
on the host operating system, and retrieve the Standard Output, Standard Error and Exit Code of the result.

You can set a shell to run the commands in, and you can specify custom environment variables too.

> [!NOTE]
> Commands will be ran with the same privileges as the ESPHome binary. Take extra care for the commands to finish! Running a
> command that never exits will lock up the ESPHome binary too.

```yaml
# Example configuration entry
button:
  - platform: template
    name: "Kernel version (sh)" # display shell type and kernel version number
    on_press:
      - lambda: |-
          auto result = esphome::host::execute_shell_command("ps -p $$ -o comm=; uname -r");
          id(last_exit_code).publish_state(result.exit_code);
          id(last_stdout).publish_state(result.stdout_output);
          id(last_stderr).publish_state(result.stderr_output);

  - platform: template
    name: "Envvars test (bash)" # display shell type and see if environment variable set works
    on_press:
      - lambda: |-
          esphome::host::ShellCommandOptions opts;
          opts.shell = "/bin/bash";
          opts.environment = {
            {"FOO", "BAR"},
          };
          auto result = esphome::host::execute_shell_command("ps -p $$ -o comm=; printf 'FOO=\"%s\"\n' \"${FOO-}\"", opts);
          id(last_exit_code).publish_state(result.exit_code);
          id(last_stdout).publish_state(result.stdout_output);
          id(last_stderr).publish_state(result.stderr_output);

  - platform: template
    name: "Run Command" # display first 255 characters of the output of any command typed in the text component
    on_press:
      - lambda: |-
          auto result = esphome::host::execute_shell_command(id(arbitrary_command).state.c_str());
          id(last_exit_code).publish_state(result.exit_code);
          id(last_stdout).publish_state(result.stdout_output.substr(0, 255));
          id(last_stderr).publish_state(result.stderr_output);

text:
  - platform: template
    name: "Command"
    initial_value: "cat /definitely-does-not-exist"
    id: arbitrary_command
    optimistic: true
    min_length: 0
    max_length: 100
    mode: text

text_sensor:
  - platform: template
    id: last_stdout
    name: "Last Command Stdout"
  - platform: template
    id: last_stderr
    name: "Last Command Stderr"

sensor:
  - platform: template
    id: last_exit_code
    name: "Last Command Exit Code"
```

## See Also

- [SDL display](/components/display/sdl#sdl)
- {{< docref "esphome/" >}}
- {{< docref "/components/time/host" >}}
