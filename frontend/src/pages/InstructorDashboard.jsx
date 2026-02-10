import { useEffect, useState } from 'react';
import { socket } from '../socket';
import {
    getFlightRequests,
    approveFlightRequest
} from '../api/flightRequests.api';

import RankedRequestsTable from '../components/RankedRequestsTable';

export default function InstructorDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // TEMP until auth
    const instructorId = 'cc7d2947-88ee-465e-91e7-f52526ffe3a2';

    const fetchRequests = async () => {
        setLoading(true);
        const res = await getFlightRequests(instructorId);
        setRequests(res.data); // ✅ NOT res.data.requests
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();

        // 👇 Join instructor room
        socket.emit('join-instructor', instructorId);

        socket.on('requests-updated', fetchRequests);

        return () => {
            socket.off('instructor-updated', fetchRequests);
        };
    }, []);

    const approve = async (flight_request_id) => {
        await approveFlightRequest(flight_request_id);

        // optimistic refresh
        fetchRequests();
    };

    if (loading) {
        return <p className="p-6">Loading…</p>;
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Instructor Dashboard</h1>

            {requests.length === 0 && (
                <div className="p-4 rounded bg-gray-100 text-gray-600">
                    No pending flight requests.
                </div>
            )}

            {requests.length > 0 && (
                <RankedRequestsTable
                    ranked={requests}
                    onApprove={approve}
                />
            )}
        </div>
    );
}
