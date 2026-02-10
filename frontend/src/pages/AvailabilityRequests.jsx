import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { useLocation, useNavigate } from 'react-router-dom';
import { getRankedRequests, approveFlightRequest } from '../api/flightRequests.api';
import RankedRequestsTable from '../components/RankedRequestsTable';
import FSIRecommendationCard from '../components/FSIRecommendationCard';

export default function AvailabilityRequests() {
    const location = useLocation();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [systemRecommendation, setSystemRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);

    const availabilityId = location.state?.availabilityId;

    useEffect(() => {
        if (!availabilityId) {
            navigate('/instructor/availability'); // hard guard
            return;
        }
    }, [availabilityId, navigate]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getRankedRequests(availabilityId);
            const ranked = res.data.ranked_requests || [];
            setRequests(ranked);

            // Show recommendation only if there are pending requests
            setSystemRecommendation(ranked.length ? res.data.system_recommendation : null);
        } catch (err) {
            console.error(err);
            setRequests([]);
            setSystemRecommendation(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();

        socket.emit('join-availability', availabilityId);

        socket.on('requests-updated', (payload) => {
            const updatedRequests = payload.requests || [];
            setRequests(updatedRequests);

            // Clear system recommendation if no pending requests
            if (updatedRequests.length === 0) {
                setSystemRecommendation(null);
            }
        });

        return () => {
            socket.off('requests-updated');
        };
    }, [availabilityId]);

    const approve = async (requestId) => {
        // Optimistic UI update: remove all requests
        setRequests([]);

        try {
            await approveFlightRequest(requestId);
        } catch (err) {
            console.error('Approval failed', err);
            // Optionally: refetch if needed
            fetchRequests();
        }
    };

    if (loading) return <p className="p-6">Loading…</p>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Requests for this Availability</h1>

            {requests.length > 0 && systemRecommendation && (
                <FSIRecommendationCard recommendation={systemRecommendation} />
            )}

            {requests.length === 0 ? (
                <p className="p-4 rounded bg-gray-100 text-gray-600">
                    No requests for this availability.
                </p>
            ) : (
                <RankedRequestsTable ranked={requests} onApprove={approve} />
            )}
        </div>
    );
}