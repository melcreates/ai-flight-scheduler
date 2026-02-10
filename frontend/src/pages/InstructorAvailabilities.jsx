import { useEffect, useState } from 'react';
import { getInstructorAvailability } from '../api/instructor.api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function InstructorAvailabilities() {
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Wait until auth is loaded
        if (authLoading) return;

        // ✅ Redirect to login if no user/token
        if (!user) {
            navigate('/login'); // redirect
            return;
        }

        const fetchAvailabilities = async () => {
            setLoading(true);
            try {
                const res = await getInstructorAvailability(user.id);
                setAvailabilities(res.data || []);
            } catch (err) {
                console.error(err);
                setAvailabilities([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailabilities();
    }, [user, authLoading, navigate]);

    if (authLoading || loading) return <p className="p-6">Loading…</p>;

    if (availabilities.length === 0) {
        return <p className="p-6">No availabilities found.</p>;
    }

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Your Availabilities. {user.name}</h1>
            <ul className="space-y-2">
                {availabilities.map(avail => (
                    <li
                        key={avail.id}
                        className="p-4 border rounded cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                            navigate('/availability', {
                                state: { availabilityId: avail.id }
                            })
                        }
                    >
                        {new Date(avail.available_start).toLocaleString()} -{' '}
                        {new Date(avail.available_end).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
}
