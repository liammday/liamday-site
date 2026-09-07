// Ambient typing for `import shader from "./x.wgsl"` (a ShaderSource, not a
// string). Ships with the @vgpu/wgsl loader that astro.config.mjs wires in.
/// <reference types="@vgpu/wgsl/wgsl-types" />
// WebGPU globals (GPUBuffer, GPUBufferUsage, …) for the vgpu-facing modules.
/// <reference types="@webgpu/types" />
