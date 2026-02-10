import api from './axios';

const handleRequest = async (fn) => {
    try {
        const res = await fn();
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const getRankedRequests = (availabilityId) =>
    handleRequest(() => api.get(`/api/requests/${availabilityId}/rank-requests`));

export const getRankedRequestsByInstructor = (instructorId) =>
    axios.get(`http://localhost:5000/api/requests/instructor/${instructorId}`);

export const approveFlightRequest = (flight_request_id) =>
    handleRequest(() => api.patch(`/api/requests/${flight_request_id}/approve`));

export const getFlightRequests = () =>
    handleRequest(() => api.get('/api/requests'));

export const createFlightRequest = (data) =>
    handleRequest(() => api.post(`/api/requests`, data));
