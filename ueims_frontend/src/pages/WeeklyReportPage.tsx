import React, { useEffect, useState } from 'react';
import { WeeklyReportService } from '../services/WeeklyReportService';

const WeeklyReportPage: React.FC = () => {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        WeeklyReportService.getAllReports().then((res: any) => setData(res.data)).catch((err: any) => console.error(err));
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">WeeklyReport Management</h1>
            <ul className="list-disc pl-5">
                {data.map((item, idx) => (
                    <li key={item.id || JSON.stringify(item)}>{JSON.stringify(item)}</li>
                ))}
            </ul>
        </div>
    );
};

export default WeeklyReportPage;
