import os
import re

sql_file = r'E:\SU26\UEIMS\001_create_schema.sql'
base_pkg = 'com.ueims'
base_dir = r'E:\SU26\UEIMS_Project\UEIMS_Project\ueims_backend\src\main\java\com\ueims'

with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# Simple regex to find CREATE TABLE blocks
table_blocks = re.findall(r'CREATE TABLE\s+(\w+)\s*\((.*?)\);', sql_content, re.IGNORECASE | re.DOTALL)

def to_camel_case(snake_str):
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def to_pascal_case(snake_str):
    components = snake_str.split('_')
    return ''.join(x.title() for x in components)

def map_type(sql_type):
    sql_type = sql_type.upper()
    if 'UUID' in sql_type: return 'UUID'
    if 'VARCHAR' in sql_type or 'TEXT' in sql_type: return 'String'
    if 'INT' in sql_type: return 'Integer'
    if 'DECIMAL' in sql_type or 'NUMERIC' in sql_type: return 'BigDecimal'
    if 'BOOLEAN' in sql_type: return 'Boolean'
    if 'TIMESTAMP' in sql_type: return 'LocalDateTime'
    if 'DATE' in sql_type: return 'LocalDate'
    if 'TIME' in sql_type: return 'LocalTime'
    return 'String'

os.makedirs(os.path.join(base_dir, 'model', 'entity'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'repository'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'service'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'service', 'impl'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'controller'), exist_ok=True)

generated_tables = []

for table_name, columns_text in table_blocks:
    class_name = to_pascal_case(table_name)
    if class_name.endswith('s'):
        class_name = class_name[:-1] # simple singularization
    if class_name == 'Statu': class_name = 'Status'
    if class_name == 'Enterpris': class_name = 'Enterprise'
    if class_name == 'SemesterEnterpris': class_name = 'SemesterEnterprise'
    if class_name == 'Entitie': class_name = 'Entity'
    if class_name == 'RolePermission': class_name = 'RolePermission'
    if class_name == 'UsersRole': class_name = 'UserRole'

    generated_tables.append(class_name)
    
    # Parse columns
    lines = columns_text.split('\n')
    fields = []
    pk_type = 'UUID'
    pk_name = 'id'
    
    for line in lines:
        line = line.split('--')[0].strip()
        if not line or line.upper().startswith(('CONSTRAINT', 'PRIMARY', 'FOREIGN', 'UNIQUE', 'CHECK')):
            continue
        parts = line.split()
        if len(parts) >= 2:
            col_name = parts[0]
            col_type = parts[1]
            java_type = map_type(col_type)
            java_name = to_camel_case(col_name)
            fields.append((java_type, java_name, col_name))
            if 'PRIMARY KEY' in line.upper():
                pk_type = java_type
                pk_name = java_name

    # 1. Entity
    entity_code = f"package {base_pkg}.model.entity;\n\n"
    entity_code += "import jakarta.persistence.*;\nimport lombok.*;\nimport java.time.*;\nimport java.util.*;\nimport java.math.BigDecimal;\n\n"
    entity_code += f"@Entity\n@Table(name = \"{table_name}\")\n"
    entity_code += "@Data\n@NoArgsConstructor\n@AllArgsConstructor\n@Builder\n"
    entity_code += f"public class {class_name} {{\n"
    
    for jt, jn, cn in fields:
        if jn == pk_name:
            entity_code += f"    @Id\n"
            if jt == 'UUID':
                entity_code += f"    @GeneratedValue(strategy = GenerationType.UUID)\n"
            elif jt == 'Integer':
                entity_code += f"    @GeneratedValue(strategy = GenerationType.IDENTITY)\n"
        entity_code += f"    @Column(name = \"{cn}\")\n"
        entity_code += f"    private {jt} {jn};\n\n"
    
    entity_code += "}\n"
    with open(os.path.join(base_dir, 'model', 'entity', f'{class_name}.java'), 'w', encoding='utf-8') as f:
        f.write(entity_code)

    # 2. Repository
    repo_code = f"package {base_pkg}.repository;\n\n"
    repo_code += f"import {base_pkg}.model.entity.{class_name};\n"
    repo_code += f"import org.springframework.data.jpa.repository.JpaRepository;\n"
    repo_code += f"import org.springframework.stereotype.Repository;\n"
    if pk_type == 'UUID':
        repo_code += f"import java.util.UUID;\n"
    repo_code += f"\n@Repository\n"
    repo_code += f"public interface {class_name}Repository extends JpaRepository<{class_name}, {pk_type}> {{\n}}\n"
    with open(os.path.join(base_dir, 'repository', f'{class_name}Repository.java'), 'w', encoding='utf-8') as f:
        f.write(repo_code)

    # 3. Service Interface
    srv_code = f"package {base_pkg}.service;\n\n"
    srv_code += f"import {base_pkg}.model.entity.{class_name};\n"
    srv_code += f"import java.util.List;\n"
    if pk_type == 'UUID':
        srv_code += f"import java.util.UUID;\n"
    srv_code += f"\npublic interface {class_name}Service {{\n"
    srv_code += f"    List<{class_name}> findAll();\n"
    srv_code += f"    {class_name} findById({pk_type} id);\n"
    srv_code += f"    {class_name} save({class_name} entity);\n"
    srv_code += f"    void deleteById({pk_type} id);\n"
    srv_code += "}\n"
    with open(os.path.join(base_dir, 'service', f'{class_name}Service.java'), 'w', encoding='utf-8') as f:
        f.write(srv_code)

    # 4. Service Impl
    impl_code = f"package {base_pkg}.service.impl;\n\n"
    impl_code += f"import {base_pkg}.model.entity.{class_name};\n"
    impl_code += f"import {base_pkg}.repository.{class_name}Repository;\n"
    impl_code += f"import {base_pkg}.service.{class_name}Service;\n"
    impl_code += f"import org.springframework.stereotype.Service;\n"
    impl_code += f"import lombok.RequiredArgsConstructor;\n"
    impl_code += f"import java.util.List;\n"
    if pk_type == 'UUID':
        impl_code += f"import java.util.UUID;\n"
    impl_code += f"\n@Service\n@RequiredArgsConstructor\n"
    impl_code += f"public class {class_name}ServiceImpl implements {class_name}Service {{\n"
    impl_code += f"    private final {class_name}Repository repository;\n\n"
    impl_code += f"    @Override\n    public List<{class_name}> findAll() {{ return repository.findAll(); }}\n\n"
    impl_code += f"    @Override\n    public {class_name} findById({pk_type} id) {{ return repository.findById(id).orElse(null); }}\n\n"
    impl_code += f"    @Override\n    public {class_name} save({class_name} entity) {{ return repository.save(entity); }}\n\n"
    impl_code += f"    @Override\n    public void deleteById({pk_type} id) {{ repository.deleteById(id); }}\n"
    impl_code += "}\n"
    with open(os.path.join(base_dir, 'service', 'impl', f'{class_name}ServiceImpl.java'), 'w', encoding='utf-8') as f:
        f.write(impl_code)

    # 5. Controller
    ctrl_code = f"package {base_pkg}.controller;\n\n"
    ctrl_code += f"import {base_pkg}.model.entity.{class_name};\n"
    ctrl_code += f"import {base_pkg}.service.{class_name}Service;\n"
    ctrl_code += f"import org.springframework.http.ResponseEntity;\n"
    ctrl_code += f"import org.springframework.web.bind.annotation.*;\n"
    ctrl_code += f"import lombok.RequiredArgsConstructor;\n"
    ctrl_code += f"import java.util.List;\n"
    if pk_type == 'UUID':
        ctrl_code += f"import java.util.UUID;\n"
    ctrl_code += f"\n@RestController\n@RequestMapping(\"/api/{table_name.replace('_', '-')}\")\n@RequiredArgsConstructor\n"
    ctrl_code += f"public class {class_name}Controller {{\n"
    ctrl_code += f"    private final {class_name}Service service;\n\n"
    ctrl_code += f"    @GetMapping\n    public ResponseEntity<List<{class_name}>> getAll() {{\n        return ResponseEntity.ok(service.findAll());\n    }}\n\n"
    ctrl_code += f"    @GetMapping(\"/{{id}}\")\n    public ResponseEntity<{class_name}> getById(@PathVariable {pk_type} id) {{\n        return ResponseEntity.ok(service.findById(id));\n    }}\n\n"
    ctrl_code += f"    @PostMapping\n    public ResponseEntity<{class_name}> create(@RequestBody {class_name} entity) {{\n        return ResponseEntity.ok(service.save(entity));\n    }}\n\n"
    ctrl_code += f"    @DeleteMapping(\"/{{id}}\")\n    public ResponseEntity<Void> delete(@PathVariable {pk_type} id) {{\n        service.deleteById(id);\n        return ResponseEntity.ok().build();\n    }}\n"
    ctrl_code += "}\n"
    with open(os.path.join(base_dir, 'controller', f'{class_name}Controller.java'), 'w', encoding='utf-8') as f:
        f.write(ctrl_code)

print(f"Generated backend classes for {len(generated_tables)} tables.")
