import React, { useEffect, useState } from 'react';
import { InternshipPlanService } from '../services/InternshipPlanService';

const InternshipPlanPage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        InternshipPlanService.getAll().then(res => setData(res.data)).catch(err => console.error(err));
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">InternshipPlan Management</h1>
            <ul className="list-disc pl-5">
                {data.map((item, idx) => (
                    <li key={item.id || JSON.stringify(item)}>{JSON.stringify(item)}</li>
                ))}
            </ul>
        </div>
    );
};

export default InternshipPlanPage;
