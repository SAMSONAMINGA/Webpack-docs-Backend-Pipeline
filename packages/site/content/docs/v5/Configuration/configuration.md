# Configuration

`interface` · defined in `webpack/types.d.ts:412`

The top-level options object passed to `webpack()`. Every other configuration
interface (module rules, resolve, optimization, dev server) hangs off this one.

## Signature

```typescript
Configuration(options: ConfigurationOptions): Configuration
```

| Parameter | Type | Optional | Description |
|---|---|---|---|
| `options` | `ConfigurationOptions` | no | The raw options object. |

## Properties

| Property | Type | Optional | Readonly | Description |
|---|---|---|---|---|
| `mode` | `"development" \| "production" \| "none"` | yes | no | Enables built-in optimizations matching the environment. |
| `entry` | `string \| string[] \| Record<string, string>` | yes | no | The entry point(s) webpack starts bundling from. |
| `output` | `OutputOptions` | yes | no | Where and how to emit the compiled bundles. |
| `module` | `ModuleOptions` | yes | no | How different module types are treated (loaders, rules). |
| `resolve` | `ResolveOptions` | yes | no | How module requests are resolved to files on disk. |
