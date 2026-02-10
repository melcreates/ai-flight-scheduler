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

export const getInstructorAvailability = (instructorId) =>
    handleRequest(() => api.get(`/api/availability/instructor/${instructorId}`));
