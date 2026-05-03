# Command Engine Architecture (Production Baseline)

Natural language is allowed exactly once: at the boundary.
Inside the system, everything is structured data.

## Final mental model

This system is a programmable vending machine with a strict interpreter layer:

1. **Boundary (Decoder)**: flexible input -> structured instruction. Ambiguity ends here.
2. **Control Plane**: policy enforcement (auth, billing, limits, isolation). No semantic interpretation.
3. **Core Engine**: deterministic execution. No policy decisions, only execution.

AI is optional and confined to the boundary.
The core remains deterministic engineering.

## System definition

A multi-tenant, policy-governed execution engine where natural language is compiled into structured commands at the boundary, then executed deterministically under strict authorization, billing, and isolation constraints.

## Three invariants (must never break)

| Invariant | Meaning | Why it matters |
| --- | --- | --- |
| Ambiguity dies at the boundary | After parsing, only structured payloads are allowed | Prevents cascading uncertainty |
| Policy never touches execution | Billing/auth/rate limits stay outside tools | Pricing and policy can evolve independently |
| Execution never interprets | Tools receive typed structured inputs, never raw text | Determinism and testability remain intact |

If any invariant is violated, the architecture becomes fragile.

## Runtime flow

```text
HTTP Request
  -> Boundary Decoder
  -> Intent (structured)
  -> Policy Checks (auth, limits, billing, tenant isolation)
  -> Deterministic Dispatcher
  -> Tool Execution
  -> Persistence + Response
```

## Responsibilities by layer

- **Boundary layer**
  - Accept natural language or external API input.
  - Convert to typed intent and validated arguments.
  - Reject ambiguity early.

- **Control plane**
  - Enforce identity, entitlements, quotas, and tenancy.
  - Allow/deny execution.
  - Never execute business actions.

- **Execution layer**
  - Perform business actions from structured arguments only.
  - Never parse user language.
  - Never embed policy checks.

## Expansion path (architecture-first)

When extending, prioritize system capabilities over ad hoc feature work:

1. **Workflows** for multi-step command chains.
2. **Event sourcing** for immutable audit trails and compliance.
3. **Background jobs** for async tasks beyond request time budgets.
4. **Plugin system** for third-party command/tool extension.

## Pitch sentence

"We turn natural language into structured actions, then execute them under strict policy control - with AI optional at the boundary and determinism guaranteed inside."

## Build rule

If a module decides **what input means**, it belongs to the boundary/core interpretation path.
If a module decides **whether execution is allowed**, it belongs to the control plane.
If a module decides **how to perform the side effect**, it belongs to the execution/tool layer.

Never mix these responsibilities.
