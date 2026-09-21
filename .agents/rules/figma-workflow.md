# Figma-to-Code Workflow & Performance Rules

Apply these optimization rules whenever handling Figma design-to-code requests (`figma-dev-mode-mcp-server`):

## 1. Fast Figma MCP Execution (Zero Timeout Rule)
- **Always exclude screenshots in initial context**: When invoking `get_design_context`, ALWAYS set `excludeScreenshot: true`. Bundling raster screenshots with AST code trees on 1440px+ frames causes MCP timeouts (3+ minutes).
- **Fetch screenshots separately if needed**: If a visual reference is strictly required, call `get_screenshot` as a standalone call on the specific node. Do not combine it with code generation in a single call.
- **Inspect structure with `get_metadata`**: Use `get_metadata` first to discover sub-nodes, layers, and specific component IDs in <2 seconds.

## 2. Asset Pipeline Optimization
- **Batch download assets**: When assets (images, SVGs) are hosted on `http://localhost:3845/assets/...`, download them all in a single consolidated PowerShell batch command into `public/images/...` rather than running multiple sequential background commands.
- **Inline SVGs for icons**: Prefer inlining small UI icons and brand logos directly as React SVG components or standard SVG tags to eliminate HTTP cache latency and avoid render flickers.
- **Stable Image Rendering**: Use standard HTML `<img>` tags with `object-cover` for full-height background hero cards rather than unconstrained Next.js `<Image fill />` to prevent re-optimization delays on component state changes.

## 3. Streamlined Implementation Plans
- When entering Planning Mode for a Figma design, immediately draft a focused `implementation_plan.md` covering:
  1. Route & Component location
  2. Form Schema / State definitions
  3. UI Component hierarchy
  4. Verification plan
- Do not perform redundant preliminary exploratory queries if the target route and schema conventions are already evident from the codebase.
