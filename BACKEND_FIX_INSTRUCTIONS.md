# Backend Fix for Project Creation Issue

## Problem
When creating a new project, you're getting this error:
```
null value in column "dev_id" of relation "projects" violates not-null constraint
```

This happens because:
1. When a client creates a project, no developer is assigned yet
2. The database has `dev_id` marked as `NOT NULL`
3. The frontend correctly sends `devId: null`

## Solution

### Option 1: SQL Database Migration (Recommended)
Run this SQL command on your PostgreSQL database:

```sql
ALTER TABLE projects ALTER COLUMN dev_id DROP NOT NULL;
```

### Option 2: Update JPA Entity (if using Spring Boot)
In your `Project.java` entity class, make sure the `devId` field is nullable:

```java
@Entity
@Table(name = "projects")
public class Project {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id")
    private Long projectId;
    
    @Column(name = "client_id", nullable = false)
    private Long clientId;
    
    @Column(name = "dev_id", nullable = true)  // ← Make this nullable = true
    private Long devId;
    
    // ... rest of fields
}
```

### Option 3: Use Liquibase/Flyway Migration
If you're using Liquibase, create a migration file:

**`db/changelog/002_make_dev_id_nullable.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog>
    <changeSet id="2" author="your-name">
        <dropNotNullConstraint 
            tableName="projects" 
            columnName="dev_id" 
            columnDataType="bigint"/>
    </changeSet>
</databaseChangeLog>
```

**Or with Flyway (`V002__make_dev_id_nullable.sql`):**
```sql
ALTER TABLE projects ALTER COLUMN dev_id DROP NOT NULL;
```

## Why This Makes Sense

Projects follow this lifecycle:
1. **Created by Client** → `dev_id = NULL` (no developer yet)
2. **Developer Takes Project** → `dev_id = <developer_id>`
3. **Project Completed** → `dev_id` remains set

Having `dev_id` nullable allows the natural workflow where projects are posted first, then picked up by developers later.

## After Applying Fix

Once you've made the database change, restart your backend server and try creating a project again. It should work!

The frontend already handles this correctly by:
- Sending `devId: null` when creating projects
- Showing "Unassigned" or "Available" for projects without developers
- Allowing developers to claim/take projects

## Verification

After applying the fix, you can verify it worked by checking the database schema:

```sql
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'dev_id';
```

Should return: `is_nullable = YES`
