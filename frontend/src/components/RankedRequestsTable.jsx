export default function RankedRequestsTable({ ranked, onApprove }) {
    return (
        <table className="w-full border">
            <thead className="bg-gray-100">
                <tr>
                    <th>Student</th>
                    <th>Lesson</th>
                    <th>FSI</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {ranked.map(r => (
                    <tr key={r.request_id} className="border-t">
                        <td>{r.student_name}</td>
                        <td>{r.lesson_type}</td>
                        <td className="font-mono">{r.fsi}</td>
                        <td>
                            <button
                                onClick={() => onApprove(r.request_id, r.availability_id)}
                                className="bg-blue-600 text-white px-3 py-1 rounded"
                            >
                                Approve
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
