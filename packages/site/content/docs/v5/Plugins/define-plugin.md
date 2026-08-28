# DefinePlugin

`class` · defined in `webpack/types.d.ts:1188`

Replaces variables in your code with other values or expressions at compile time. Useful for injecting environment-specific constants like `process.env.NODE_ENV`.

## Signature

```typescript
new DefinePlugin(definitions: Record<string, string>)
```

| Parameter | Type | Optional | Description |
|---|---|---|---|
| `definitions` | `Record<string, string>` | no | A map of identifiers to replace and the code to replace them with. |

## Example

```javascript
new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify('production'),
});
```
