## Summary
<!-- 2-4 bullet points describing what this PR changes -->

-
-

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / code cleanup
- [ ] Documentation
- [ ] DevOps / infra

## Test plan
<!-- Steps to verify this works correctly -->

- [ ] Backend compiles: `cd backend && ./mvnw compile -DskipTests`
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] Manual smoke test on http://localhost:5173
- [ ]

## Demo credentials (if UI changes)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@harithafashion.com | password |
| Seller | seller@harithafashion.com | password |
| Customer | customer@harithafashion.com | password |

## Checklist
- [ ] No `.env` or secrets committed
- [ ] New API endpoints have `@PreAuthorize` guards where needed
- [ ] Lazy-loading / `LazyInitializationException` risks addressed (use DTOs or eager fetch)
- [ ] No `console.log` / debug statements left in frontend
