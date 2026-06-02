DO $$
BEGIN
    -- 1. Insert permissions
    INSERT INTO permissions (permission_name, description) VALUES
        ('IMPORT_ELIGIBLE_STUDENT', 'Allow importing eligible students from Excel'),
        ('EXPORT_OJT_STUDENT', 'Allow exporting OJT students to Excel'),
        ('FINALIZE_OJT_LIST', 'Allow finalizing the OJT list for a semester')
    ON CONFLICT (permission_name) DO NOTHING;

    -- 2. Assign permissions to TRAINING_MANAGER role
    INSERT INTO role_permissions (role_name, permission_name) VALUES
        ('TRAINING_MANAGER', 'IMPORT_ELIGIBLE_STUDENT'),
        ('TRAINING_MANAGER', 'EXPORT_OJT_STUDENT'),
        ('TRAINING_MANAGER', 'FINALIZE_OJT_LIST')
    ON CONFLICT (role_name, permission_name) DO NOTHING;
END $$;
