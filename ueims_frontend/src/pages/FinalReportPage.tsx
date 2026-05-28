import React, { useEffect, useState } from 'react';
import { FinalReportService } from '../services/FinalReportService';

const FinalReportPage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        FinalReportService.getAll().then(res => setData(res.data)).catch(err => console.error(err));
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">FinalReport Management</h1>
            <ul className="list-disc pl-5">
                {data.map((item, idx) => (
                    <li key={idx}>{JSON.stringify(item)}</li>
                ))}
            </ul>
        </div>
    );
};

export default FinalReportPage;
