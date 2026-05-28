import React, { useEffect, useState } from 'react';
import { EligibleStudentService } from '../services/EligibleStudentService';

const EligibleStudentPage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        EligibleStudentService.getAll().then(res => setData(res.data)).catch(err => console.error(err));
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">EligibleStudent Management</h1>
            <ul className="list-disc pl-5">
                {data.map((item, idx) => (
                    <li key={idx}>{JSON.stringify(item)}</li>
                ))}
            </ul>
        </div>
    );
};

export default EligibleStudentPage;
