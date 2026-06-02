DO $$
BEGIN
    -- 1. Insert permissions
    INSERT INTO permissions (permission_name, description) VALUES
        ('IMPORT_ELIGIBLE_STUDENT', 'Allow importing eligible students from Excel'),
        ('EXPORT_OJT_STUDENT', 'Allow exporting OJT students to Excel'),
        ('FINALIZE_OJT_LIST', 'Allow finalizing the OJT list for a semester'),
        ('VIEW_INCIDENT', 'Allow viewing incidents'),
        ('MANAGE_INCIDENT', 'Allow managing (create/delete) incidents'),
        ('REPORT_INCIDENT', 'Allow reporting an incident'),
        ('RESOLVE_INCIDENT', 'Allow resolving an incident')
    ON CONFLICT (permission_name) DO NOTHING;

    -- 2. Assign permissions to roles
    INSERT INTO role_permissions (role_name, permission_name) VALUES
        ('TRAINING_MANAGER', 'IMPORT_ELIGIBLE_STUDENT'),
        ('TRAINING_MANAGER', 'EXPORT_OJT_STUDENT'),
        ('TRAINING_MANAGER', 'FINALIZE_OJT_LIST'),
        ('TRAINING_MANAGER', 'VIEW_INCIDENT'),
        ('TRAINING_MANAGER', 'MANAGE_INCIDENT'),
        ('TRAINING_MANAGER', 'RESOLVE_INCIDENT'),
        ('ADMIN', 'VIEW_INCIDENT'),
        ('ADMIN', 'MANAGE_INCIDENT'),
        ('STUDENT', 'REPORT_INCIDENT'),
        ('ENTERPRISE', 'REPORT_INCIDENT')
    ON CONFLICT (role_name, permission_name) DO NOTHING;
END $$;
