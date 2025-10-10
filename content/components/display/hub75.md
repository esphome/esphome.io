---
description: "Instructions for setting up HUB75 RGB LED matrix displays."
title: "HUB75 RGB LED Matrix Display"
params:
  seo:
    description: Instructions for setting up HUB75 RGB LED matrix displays.
    image: hub75.svg
---

The `hub75` display platform allows you to use HUB75 RGB LED matrix panels with ESPHome. This component wraps the [ESP32-HUB75-MatrixPanel-DMA](https://github.com/mrcodetastic/ESP32-HUB75-MatrixPanel-DMA) library, which uses DMA (Direct Memory Access) for efficient, low-CPU-overhead driving of LED matrix panels.

HUB75 displays are RGB LED matrix panels that use parallel row updating to create dynamic, colorful displays. They are commonly available in sizes like 64×32, 64×64, and can be chained together to create larger displays.

## Hardware Requirements

**Supported ESP32 Variants:**

- ESP32 (original)
- ESP32-S2
- ESP32-S3

> [!WARNING]
> This component does **NOT** work with RISC-V ESP32 variants such as ESP32-C3, ESP32-C2, ESP32-C6, or ESP32-H2.

**Memory Considerations:**

- Uses significant internal SRAM for DMA buffering
- Larger displays or longer chains require more memory
- ESP32-S3 with PSRAM can help with memory constraints
- Memory usage increases with panel resolution and chain length

**Power Supply:**

- Requires dedicated power supply for the LED panels
- Proper grounding between ESP32 and panel is essential
- Add capacitors to power lines to prevent flickering

**Supported Panel Types:**

- "Two scan" panels (1/16 and 1/32 scan rates)
- Panels with various driver chips (FM6124, FM6126A, ICN2038S, MBI5124, SM5266, etc.)

## Pin Connections

HUB75 panels use a standard connector with the following pins:

| HUB75 Pin | Description          | Default GPIO | ESPHome Config |
|-----------|----------------------|--------------|----------------|
| R1        | Red data (top half)  | 25           | `r1_pin`       |
| G1        | Green data (top)     | 26           | `g1_pin`       |
| B1        | Blue data (top)      | 27           | `b1_pin`       |
| R2        | Red data (bottom)    | 14           | `r2_pin`       |
| G2        | Green data (bottom)  | 12           | `g2_pin`       |
| B2        | Blue data (bottom)   | 13           | `b2_pin`       |
| A         | Row address bit 0    | 23           | `a_pin`        |
| B         | Row address bit 1    | 19           | `b_pin`        |
| C         | Row address bit 2    | 5            | `c_pin`        |
| D         | Row address bit 3    | 17           | `d_pin`        |
| E         | Row address bit 4    | -            | `e_pin`        |
| LAT       | Latch/Strobe         | 4            | `lat_pin`      |
| OE        | Output Enable        | 15           | `oe_pin`       |
| CLK       | Clock                | 16           | `clk_pin`      |
| GND       | Ground               | GND          | N/A            |

> [!NOTE]
> The E pin is only required for 1/32 scan panels (panels with 32 or 64 rows). It can be omitted for 1/16 scan panels.

> [!WARNING]
> Some of the default pins are strapping pins on ESP32. It's recommended to change at least the R2, G2, and B2 pins to avoid issues during boot. Some panels may not work with the default pin configuration.

## Usage

```yaml
# Example minimal configuration entry
display:
  - platform: hub75
    id: matrix_display
    width: 64
    height: 32
    lambda: |-
      it.print(0, 0, id(font), "Hello World!");
```

> [!NOTE]
> Unlike some other display components, HUB75 does **NOT** require an SPI bus configuration. It uses I2S and DMA internally.

## Configuration Variables

**Display Dimensions (Required):**

- **width** (**Required**, int): Width of a single panel in pixels.
- **height** (**Required**, int): Height of a single panel in pixels.

**Display Options:**

- **chain_length** (*Optional*, int): Number of panels chained horizontally. Defaults to `1`.
- **brightness** (*Optional*, int): Initial brightness (0-255). Defaults to `128`.
- **double_buffer** (*Optional*, boolean): Enable double buffering to prevent tearing. Defaults to `true`. Set to `false` when using LVGL.
- **update_interval** (*Optional*, [Time](#config-time)): Update frequency. Defaults to `16ms` (approximately 60 FPS).

**Pin Configuration (All Optional with defaults shown above):**

- **r1_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Red data pin for top half. Defaults to `GPIO25`.
- **g1_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Green data pin for top half. Defaults to `GPIO26`.
- **b1_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Blue data pin for top half. Defaults to `GPIO27`.
- **r2_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Red data pin for bottom half. Defaults to `GPIO14`.
- **g2_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Green data pin for bottom half. Defaults to `GPIO12`.
- **b2_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Blue data pin for bottom half. Defaults to `GPIO13`.
- **a_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Row address A. Defaults to `GPIO23`.
- **b_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Row address B. Defaults to `GPIO19`.
- **c_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Row address C. Defaults to `GPIO5`.
- **d_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Row address D. Defaults to `GPIO17`.
- **e_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Row address E. Required for 1/32 scan panels, omit for 1/16 scan.
- **lat_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Latch pin. Defaults to `GPIO4`.
- **oe_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Output enable pin. Defaults to `GPIO15`.
- **clk_pin** (*Optional*, [Pin Schema](#config-pin_schema)): Clock pin. Defaults to `GPIO16`.

**Advanced Configuration:**

- **driver** (*Optional*): LED driver chip type. One of:
  - `SHIFTREG` (default) - Standard shift register
  - `FM6124` - FM6124 driver
  - `FM6126A` - FM6126A driver
  - `ICN2038S` - ICN2038S driver
  - `MBI5124` - MBI5124 driver
  - `SM5266` - SM5266P driver
  - `DP3246_SM5368` - DP3246/SM5368 driver

- **i2s_speed** (*Optional*): I2S clock speed. One of:
  - `HZ_8M` - 8 MHz
  - `HZ_10M` - 10 MHz
  - `HZ_15M` - 15 MHz
  - `HZ_16M` - 16 MHz
  - `HZ_20M` - 20 MHz

- **latch_blanking** (*Optional*, int): Number of clock cycles OE is blanked before and after LAT changes.
- **clock_phase** (*Optional*, boolean): Clock phase setting for the display.

**Virtual Matrix Configuration:**

- **virtual_matrix** (*Optional*): Configuration for arranging multiple panels in a 2D grid. See [Virtual Matrix](#virtual-matrix) section below.

All standard [graphical display configuration](#display-configuration) options are also available, including **lambda**, **pages**, **rotation**, and **auto_clear_enabled**.

## Virtual Matrix

The virtual matrix feature allows you to arrange multiple panels in a 2D grid (not just a horizontal chain). This is useful when you want to create a large display by tiling panels both horizontally and vertically.

> [!IMPORTANT]
> When using virtual matrix, `chain_length` must equal `rows` × `cols`. The component will validate this and report an error if they don't match.

### Virtual Matrix Options

- **rows** (*Optional*, int): Number of panel rows in the grid. Defaults to `1`.
- **cols** (*Optional*, int): Number of panel columns in the grid. Defaults to `1`.
- **chain_type** (*Optional*): Physical chain layout. Defaults to `CHAIN_TOP_LEFT_DOWN`. Options:
  - `CHAIN_TOP_LEFT_DOWN` - Start top-left, chain downward
  - `CHAIN_TOP_RIGHT_DOWN` - Start top-right, chain downward
  - `CHAIN_BOTTOM_LEFT_UP` - Start bottom-left, chain upward
  - `CHAIN_BOTTOM_RIGHT_UP` - Start bottom-right, chain upward
  - `CHAIN_TOP_LEFT_DOWN_ZZ` - Start top-left, zigzag pattern
  - `CHAIN_TOP_RIGHT_DOWN_ZZ` - Start top-right, zigzag pattern
  - `CHAIN_BOTTOM_LEFT_UP_ZZ` - Start bottom-left, zigzag pattern
  - `CHAIN_BOTTOM_RIGHT_UP_ZZ` - Start bottom-right, zigzag pattern

- **scan_type** (*Optional*): Panel scan pattern. Defaults to `STANDARD_TWO_SCAN`. Options:
  - `STANDARD_TWO_SCAN` - Standard 1/16 or 1/32 scan
  - `FOUR_SCAN_16PX_HIGH` - Four-scan for 16px high panels
  - `FOUR_SCAN_32PX_HIGH` - Four-scan for 32px high panels
  - `FOUR_SCAN_40PX_HIGH` - Four-scan for 40px high panels
  - `FOUR_SCAN_40_80PX_HFARCAN` - Four-scan for 40/80px HFARCAN panels
  - `FOUR_SCAN_64PX_HIGH` - Four-scan for 64px high panels

### Virtual Matrix Example

```yaml
# 2x2 grid of 64x32 panels = 128x64 total display
display:
  - platform: hub75
    id: matrix_display
    width: 64
    height: 32
    chain_length: 4  # Must equal 2 * 2
    virtual_matrix:
      rows: 2
      cols: 2
      chain_type: CHAIN_TOP_LEFT_DOWN
      scan_type: STANDARD_TWO_SCAN
```

## Using with LVGL

When using this display with {{< docref "/components/lvgl/index" "LVGL" >}}, you must configure the display as follows:

```yaml
display:
  - platform: hub75
    id: matrix_display
    width: 64
    height: 32
    update_interval: never
    auto_clear_enabled: false
    double_buffer: false
    # LVGL configuration goes separately
```

The three key settings for LVGL are:

- `update_interval: never` - LVGL controls when to update
- `auto_clear_enabled: false` - LVGL handles clearing
- `double_buffer: false` - LVGL manages its own buffering

## Configuration Examples

### Basic Single Panel

```yaml
display:
  - platform: hub75
    id: matrix_display
    width: 64
    height: 32
    lambda: |-
      it.print(0, 0, id(font), "Hello!");
```

### Horizontally Chained Panels

```yaml
# Three 64x32 panels chained = 192x32 total
display:
  - platform: hub75
    id: matrix_display
    width: 64
    height: 32
    chain_length: 3
    lambda: |-
      it.printf(0, 0, id(font), "Panel width: %d", it.get_width());
```

### Custom Pin Configuration

```yaml
# Using different pins to avoid strapping pins
display:
  - platform: hub75
    id: matrix_display
    width: 64
    height: 32
    r1_pin: GPIO25
    g1_pin: GPIO26
    b1_pin: GPIO27
    r2_pin: GPIO21  # Changed from default
    g2_pin: GPIO22  # Changed from default
    b2_pin: GPIO32  # Changed from default
    a_pin: GPIO23
    b_pin: GPIO19
    c_pin: GPIO5
    d_pin: GPIO17
    lat_pin: GPIO4
    oe_pin: GPIO15
    clk_pin: GPIO16
```

### Advanced Configuration with Driver

```yaml
display:
  - platform: hub75
    id: matrix_display
    width: 64
    height: 32
    driver: FM6126A
    i2s_speed: HZ_20M
    brightness: 200
    latch_blanking: 2
    lambda: |-
      it.fill(Color(255, 0, 0));  # Red background
```

### 2×2 Virtual Matrix Grid

```yaml
# Four 64x32 panels in a 2x2 grid = 128x64 total
display:
  - platform: hub75
    id: matrix_display
    width: 64
    height: 32
    chain_length: 4
    virtual_matrix:
      rows: 2
      cols: 2
      chain_type: CHAIN_TOP_LEFT_DOWN_ZZ
    lambda: |-
      it.printf(32, 28, id(font), "128x64");
```

## Important Notes

- **ESP32-only**: This component only works with ESP32, ESP32-S2, and ESP32-S3. RISC-V variants (C3, C6, H2) are not supported.
- **Memory limitations**: The DMA buffer can consume significant RAM. Larger displays or long chains may not fit in available memory.
- **Strapping pins**: The default pin configuration uses some strapping pins. If your ESP32 has boot issues, change the R2, G2, and B2 pins.
- **Driver compatibility**: Different panels use different driver chips. If colors appear wrong or the display doesn't work, try different driver settings.
- **Power supply**: Always use a dedicated power supply for the panels. LED matrices can draw significant current.
- **E pin requirement**: The E pin is required for 1/32 scan panels (32 or 64 rows). It can be omitted for 1/16 scan panels (16 rows).

For more advanced configuration options and troubleshooting, refer to the [ESP32-HUB75-MatrixPanel-DMA documentation](https://github.com/mrcodetastic/ESP32-HUB75-MatrixPanel-DMA).

## See Also

- {{< docref "index/" >}}
- {{< docref "/components/lvgl/index" "LVGL Component" >}}
- {{< apiref "hub75/hub75.h" "hub75/hub75.h" >}}
- [ESP32-HUB75-MatrixPanel-DMA Library](https://github.com/mrcodetastic/ESP32-HUB75-MatrixPanel-DMA)
