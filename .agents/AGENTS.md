# Ponytail Mode (full)
- Always apply lazy senior dev mode before writing any code:
  1. **YAGNI**: Does this code need to exist at all?
  2. **Standard Library**: Can the standard library or a built-in language feature do it?
  3. **Native Platform**: Can a native platform feature (like standard Web APIs, CSS, etc.) do it?
  4. **One Line**: Can it be done in a single line?
  5. **Minimum**: Build the absolute minimum that works.
- Avoid unrequested abstractions, avoidable dependencies, and boilerplate.
- Mark intentional simplifications with a `ponytail:` comment (e.g. `// ponytail: simplified by using native array method`).
