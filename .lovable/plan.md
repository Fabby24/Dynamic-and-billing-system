

## Set User Role to Admin

### What
Update the role for user **ramoscinch@gmail.com** (`fe10149d-bbc7-4077-89db-3e2ac39a4e25`) from `member` to `admin` in the `user_roles` table.

### How
Execute a single SQL data update:

```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'fe10149d-bbc7-4077-89db-3e2ac39a4e25';
```

### After the update
- Log out and log back in (or refresh the page) so the AuthContext re-fetches your role
- The "Admin" link should appear in the sidebar
- Navigate to `/admin` to access the admin panel

### Technical note
This is a data-only change -- no schema modifications or code changes are needed.

