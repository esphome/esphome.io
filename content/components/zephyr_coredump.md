---
description: "Zephyr GDB coredump"
title: "Zephyr GDB coredump"
---

This component helps debug crashes without requiring SWD. When a crash occurs, the stack memory is saved to flash.
On the next boot, the stored stack memory is printed to the logs.
These logs can then be used to reconstruct the call stack, as described in the Zephyr coredump documentation:
https://docs.zephyrproject.org/latest/services/debugging/coredump.html

```yaml
# Example configuration entry
esphome:
  name: coredump-test
  on_boot:
    then:
      - delay: 30s
      - lambda: |-
          // Intentionally trigger a crash
          volatile uint32_t *p = (uint32_t *)0xDEADBEEF;
          *p = 0xDEADBEEF;

zephyr_coredump:
```

## Crash log example

```
[14:36:08.267][E][coredump:052]: #CD:BEGIN#
[14:36:08.267][E][coredump:039]: #CD:5a450100030005001a0000004102004400d0670020b4670020efbeadde00b0ad
[14:36:08.269][E][coredump:039]: #CD:de00000000296201002862010000000001505500200000000000000000000000
[14:36:08.321][E][coredump:039]: #CD:ac0000
[14:36:08.321][E][coredump:087]: #CD:END#
[14:36:08.321][E][coredump:090]: Stored coredump printed.
```

## GDB callstack example

```gdb
0x00016228 in esphome::StatelessLambdaAction<>::play() (this=<optimized out>)
    at .esphome/build/coredump-test/src/esphome/core/base_automation.h:231
231	  void play(const Ts &...x) override { this->f_(x...); }
(gdb) bt
#0  0x00016228 in esphome::StatelessLambdaAction<>::play() (
    this=<optimized out>)
    at .esphome/build/coredump-test/src/esphome/core/base_automation.h:231
#1  0x000163ce in esphome::Action<>::play_complex() (this=0x0 <get_data>)
    at .esphome/build/coredump-test/zephyr/../src/esphome/core/automation.h:268
#2  0x000163bc in esphome::Action<>::play_next_() (this=<optimized out>)
    at .esphome/build/coredump-test/zephyr/../src/esphome/core/automation.h:299
#3  0x000163de in esphome::DelayAction<>::play_complex()::{lambda()#1}::operator()() const (__closure=<optimized out>)
    at .esphome/build/coredump-test/src/esphome/core/base_automation.h:195
#4  std::__invoke_impl<void, esphome::DelayAction<>::play_complex()::{lambda()#1}&>(std::__invoke_other, esphome::DelayAction<>::play_complex()::{lambda()#1}&)
    (__f=...)
    at .platformio/packages/toolchain-gccarmnoneeabi/zephyr-sdk-0.17.4/arm-zephyr-eabi/arm-zephyr-eabi/include/c++/12.2.0/bits/invoke.h:61
#5  std::__invoke_r<void, esphome::DelayAction<>::play_complex()::{lambda()#1}&>(esphome::DelayAction<>::play_complex()::{lambda()#1}&) (__fn=...)
    at .platformio/packages/toolchain-gccarmnoneeabi/zephyr-sdk-0.17.4/arm-zephyr-eabi/arm-zephyr-eabi/include/c++/12.2.0/bits/invoke.h:111
--Type <RET> for more, q to quit, c to continue without paging--
#6  std::_Function_handler<void (), esphome::DelayAction<>::play_complex()::{lambda()#1}>::_M_invoke(std::_Any_data const&) (__functor=...)
    at .platformio/packages/toolchain-gccarmnoneeabi/zephyr-sdk-0.17.4/arm-zephyr-eabi/arm-zephyr-eabi/include/c++/12.2.0/bits/std_function.h:290
#7  0x000159f6 in std::function<void ()>::operator()() const (this=this@entry=0x20006b20)
    at .platformio/packages/toolchain-gccarmnoneeabi/zephyr-sdk-0.17.4/arm-zephyr-eabi/arm-zephyr-eabi/include/c++/12.2.0/bits/std_function.h:591
#8  0x0000470a in esphome::Scheduler::execute_item_ (this=this@entry=0x20001d98 <esphome::App>, item=0x20006b10, now=now@entry=0)
    at .esphome/build/coredump-test/src/esphome/core/scheduler.cpp:617
#9  0x000161a8 in esphome::Scheduler::call (this=this@entry=0x20001d98 <esphome::App>, now=0, now@entry=30372)
    at .esphome/build/coredump-test/src/esphome/core/scheduler.cpp:528
#10 0x00014ec0 in esphome::Application::before_loop_tasks_ (this=this@entry=0x20001d98 <esphome::App>, loop_start_time=loop_start_time@entry=30372)
    at .esphome/build/coredump-test/src/esphome/core/application.cpp:520
#11 0x00003850 in esphome::Application::loop (this=0x20001d98 <esphome::App>) at .esphome/build/coredump-test/src/esphome/core/application.cpp:152
#12 0x00004d20 in loop () at i.yaml:135
#13 0x00014b38 in main () at .esphome/build/coredump-test/src/esphome/components/zephyr/core.cpp:104
```

## See Also
