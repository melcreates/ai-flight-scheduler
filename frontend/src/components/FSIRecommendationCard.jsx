export default function FSIRecommendationCard({ recommendation }) {
    return (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
            <h2 className="font-semibold text-green-800">
                System Recommendation
            </h2>
            <p className="mt-2">
                <strong>{recommendation.student_name}</strong>
                {' '}— FSI Score: {recommendation.fsi}
            </p>
        </div>
    );
}
