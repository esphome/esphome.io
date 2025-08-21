# Add documentation for runtime_stats component

## Summary

This PR adds documentation for the new `runtime_stats` component that helps developers debug performance issues and identify components blocking the event loop.

## Related ESPHome PR

- esphome/esphome#[PR number] - Add runtime_stats component for performance debugging and analysis

## Changes

- Added `components/runtime_stats.rst` with comprehensive documentation including:
  - Component description and use cases
  - Configuration options
  - Understanding the output format
  - Example configurations and output
  - Tips for effective usage
  - Important notes about millisecond resolution and performance overhead

## Key points documented

- The component is intended for debugging and troubleshooting
- Can be temporarily enabled in production but should not be left running long-term
- Uses millisecond resolution (millis()) so cannot measure sub-millisecond operations
- Provides both period and total statistics
- Components are sorted by execution time to highlight performance bottlenecks

## Preview

The documentation includes:
- Clear warnings about performance overhead
- Example YAML configuration
- Sample output with explanation
- Use cases for different debugging scenarios
- Best practices for using the component effectively