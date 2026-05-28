import os
import re

sql_file = r'E:\SU26\UEIMS\001_create_schema.sql'
base_dir = r'E:\SU26\UEIMS_Project\UEIMS_Project\ueims_frontend\src'

with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

table_blocks = re.findall(r'CREATE TABLE\s+(\w+)\s*\((.*?)\);', sql_content, re.IGNORECASE | re.DOTALL)

def to_pascal_case(snake_str):
    components = snake_str.split('_')
    return ''.join(x.title() for x in components)

generated_tables = []

for table_name, _ in table_blocks:
    class_name = to_pascal_case(table_name)
    if class_name.endswith('s'):
        class_name = class_name[:-1]
    if class_name == 'Statu': class_name = 'Status'
    if class_name == 'Enterpris': class_name = 'Enterprise'
    if class_name == 'SemesterEnterpris': class_name = 'SemesterEnterprise'
    if class_name == 'Entitie': class_name = 'Entity'
    if class_name == 'RolePermission': class_name = 'RolePermission'
    if class_name == 'UsersRole': class_name = 'UserRole'

    generated_tables.append(class_name)
    
    # 1. Frontend Service (Axios)
    service_code = f"import axios from 'axios';\n\n"
    service_code += f"const API_URL = 'http://localhost:8080/api/{table_name.replace('_', '-')}';\n\n"
    service_code += f"export const {class_name}Service = {{\n"
    service_code += f"    getAll: () => axios.get(API_URL),\n"
    service_code += f"    getById: (id: string) => axios.get(`${{API_URL}}/${{id}}`),\n"
    service_code += f"    create: (data: any) => axios.post(API_URL, data),\n"
    service_code += f"    update: (id: string, data: any) => axios.put(`${{API_URL}}/${{id}}`, data),\n"
    service_code += f"    delete: (id: string) => axios.delete(`${{API_URL}}/${{id}}`)\n"
    service_code += f"}};\n"
    
    with open(os.path.join(base_dir, 'services', f'{class_name}Service.ts'), 'w', encoding='utf-8') as f:
        f.write(service_code)

    # 2. Frontend Page (React Component)
    page_code = f"import React, {{ useEffect, useState }} from 'react';\n"
    page_code += f"import {{ {class_name}Service }} from '../services/{class_name}Service';\n\n"
    page_code += f"const {class_name}Page: React.FC = () => {{\n"
    page_code += f"    const [data, setData] = useState<any[]>([]);\n\n"
    page_code += f"    useEffect(() => {{\n"
    page_code += f"        {class_name}Service.getAll().then(res => setData(res.data)).catch(err => console.error(err));\n"
    page_code += f"    }}, []);\n\n"
    page_code += f"    return (\n"
    page_code += f"        <div className=\"p-4\">\n"
    page_code += f"            <h1 className=\"text-2xl font-bold mb-4\">{class_name} Management</h1>\n"
    page_code += f"            <ul className=\"list-disc pl-5\">\n"
    page_code += f"                {{data.map((item, idx) => (\n"
    page_code += f"                    <li key={{idx}}>{{JSON.stringify(item)}}</li>\n"
    page_code += f"                ))}}\n"
    page_code += f"            </ul>\n"
    page_code += f"        </div>\n"
    page_code += f"    );\n"
    page_code += f"}};\n\n"
    page_code += f"export default {class_name}Page;\n"
    
    with open(os.path.join(base_dir, 'pages', f'{class_name}Page.tsx'), 'w', encoding='utf-8') as f:
        f.write(page_code)

print(f"Generated frontend services and pages for {len(generated_tables)} tables.")
