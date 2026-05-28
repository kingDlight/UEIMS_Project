import React, { useEffect, useState } from 'react';
import { AuditLogService } from '../services/AuditLogService';

const AuditLogPage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        AuditLogService.getAll().then(res => setData(res.data)).catch(err => console.error(err));
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">AuditLog Management</h1>
            <ul className="list-disc pl-5">
                {data.map((item, idx) => (
                    <li key={idx}>{JSON.stringify(item)}</li>
                ))}
            </ul>
        </div>
    );
};

export default AuditLogPage;
