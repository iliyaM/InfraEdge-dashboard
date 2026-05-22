# InfraEdge

A Hebrew RTL task management SPA built with Angular 19.

## How to run

**Prerequisites:** Node.js 18+, Angular CLI 19

```bash
# Install dependencies
npm install

# Start the mock API (port 3000)
npm run start-mock-server-and-data

# In a separate terminal, start the dev server (port 4200)
ng serve
```

Navigate to `http://localhost:4200` and log in with:
- **Email:** alice@example.com
- **Password:** alice123

---

## Architecture decisions

**Standalone components (no NgModules)**
Angular 19's default. Keeps each component self-contained — imports are explicit and co-located with the component, which makes dependency tracing straightforward.

**Signals for state management**
`TaskService` owns `tasks`, `loading`, and `error` as `WritableSignal`s. Computed signals in `DashboardComponent` derive the three Kanban columns reactively. No manual `subscribe`/`unsubscribe` for view updates, no `ChangeDetectionStrategy.OnPush` boilerplate needed.

**State lives in the service, not the component**
`TaskService` is `providedIn: 'root'`. Moving the task signals there means any future component can read or mutate task state without prop-drilling or a separate store library.

**String enum for `TaskPriority`**
`enum TaskPriority { High = 'high', ... }` instead of numeric values keeps the API payload and template bindings human-readable, and lets the enum be used directly in `[class]` bindings and filter comparisons without a separate label map.

**`takeUntilDestroyed` for subscription cleanup**
HTTP calls in components are piped through `takeUntilDestroyed(this.destroyRef)` rather than manual `Subscription` tracking. Cleaner and less error-prone — no `ngOnDestroy` boilerplate needed.

**Auth interceptor**
Token injection is centralised in an `HttpInterceptor` rather than being added per-call. Every outgoing request automatically carries `Authorization: Bearer <token>` without the call sites knowing about auth.

**SCSS design tokens**
Colors are defined once in `src/styles/colors.scss` and consumed via `@use` across all component stylesheets. The page gradient is a shared mixin. Changing the brand color or swapping a palette is a one-line edit.

---

## What I would improve or add with more time

- **Support for other languages / full i18n** — the app is currently Hebrew-only and hard-coded RTL. Using Angular's `@angular/localize` with an i18n config would allow multiple locales and automatic LTR/RTL switching per locale.
- **Drag-and-drop between columns** — move tasks across Kanban columns visually using the CDK `DragDropModule`, with the status PATCH fired on drop.
- **Task editing** — an edit modal to update the title, priority, and description of an existing task, not just its status.
- **Task details** — due dates, descriptions, and assignees to make tasks more actionable.
- **Optimistic updates** — update the signal immediately on user action and roll back if the API call fails, so the UI feels instant even on slow connections.
- **Real backend** — replace `json-server` with a proper API including JWT refresh tokens, role-based access, and persistent storage.
- **Unit and E2E tests** — component unit tests with Angular Testing Library and Cypress or Playwright for end-to-end flows (login → create task → change status → delete).
- **Pagination or virtual scrolling** — for users with many tasks, avoid rendering all cards at once.
- **Dark mode** — a second SCSS theme swapped via a CSS class on `:root`, toggled from the header.
