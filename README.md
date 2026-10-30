# DBbackendTask

## User API

Set `MONGODB_URL`, `JWT_SECRET`, and `PORT` in the environment, then run `npm start`.

Public signup creates student accounts only. The supported roles are `student` and
`faculty`; faculty accounts must be provisioned by a trusted administrator with
the `faculty` role. Login returns a JWT whose payload includes the user's role.
Send it on protected routes as `Authorization: Bearer <token>`.

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/user/signup` | Public | Create a student (`name`, `email`, `password`) |
| POST | `/api/user/login` | Public | Log in (`email`, `password`) |
| GET | `/api/user/faculty` | Faculty | List active faculty |
| GET | `/api/user/students` | Faculty | List active students |
| GET | `/api/user/mems` | Faculty | List all active users |
| GET | `/api/user/mempop` | Faculty | List active users with profiles |
| GET | `/api/user/search` | Faculty | Search active users by `name` or `email` |
| POST | `/api/user/profile` | Logged-in user | Add the caller's profile (`age`, `dob`, `bio`) |
| PUT | `/api/user/update/:id` | Owner or faculty | Update own account/profile; faculty may also update student accounts/profiles |
| DELETE | `/api/user/softdelete/:id` | Faculty | Soft-delete a student account |

Updates accept `name`, `email`, `age`, `dob`, and `bio`. Role, active status,
password, and profile ownership cannot be changed through the update endpoint.
Students can update only their own accounts and profiles. Faculty can update
their own account/profile and any student's account/profile, but not another
faculty account. Inactive accounts are excluded from listings and cannot log in.
