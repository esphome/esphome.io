---
description: "Create audio clip files for use with I²S Speakers"
title: "Create audio clip files for use with I²S Speakers"
---

.. audio_clips_for_i2s:

It is possible to create sound clips to include in your build to use with I²S speakers. No need for a media player component!

- Using [Audacity](https://github.com/audacity/audacity), convert audio to WAV, mono, 16kHz, Unsigned 8bit PCM

{{< img src="save_as_wav.png" alt="Audacity export dialog" height="200" class="align-center" >}}

- Convert again, this time with [SOX](https://github.com/chirlu/sox).

```shell
sox startup.wav --bits 8 --encoding signed-integer --endian little startup_again.raw
```

- Now convert it into a hexadecimal string using [xxd](https://github.com/ckormanyos/xxd) into a C++ file.

```shell
xxd -i startup_again.raw startup.c
```

- The resulting file needs a modification in the start line:
  Open in an editor and change
  `unsigned char startup_again_raw[] = {…[SNIP]…}`
  to
  `std::vector<unsigned char> startup_raw = {…[SNIP]…}`.

Now you can rename the file to startup.h, put it inside the esphome configuration directory and put it in a include
in your device config like this:

```yaml
esphome:
  includes:
    - startup.h
```

Now you can define using the audio clip using the following:

```yaml
- speaker.play:
    id: speaker
    data: !lambda return startup_raw;
```

Enjoy!

HowTo by [NUT].

## See also

- {{< docref "/components/speaker" >}}
- {{< docref "/components/speaker/i2s_audio" >}}
