export default function RegulationCard({ reg, deleteRegulation }: any) {

  return (

    <div className="border rounded-xl p-6 flex justify-between items-start bg-white shadow-sm">

      <div>

        <h3 className="text-lg font-semibold">
          {reg.title}
        </h3>

        <p className="text-gray-500 text-sm mt-1">
          {reg.description}
        </p>

        <div className="flex gap-10 text-sm mt-4">

          <div>
            <p className="text-gray-500">Due Date</p>
            <p className="font-medium">{reg.dueDate}</p>
          </div>

          <div>
            <p className="text-gray-500">Last Audit</p>
            <p className="font-medium">{reg.lastAudit || "N/A"}</p>
          </div>

        </div>

      </div>

      <div className="flex flex-col items-end gap-3">

        <span className={`px-3 py-1 rounded text-sm font-medium ${
          reg.status === "Compliant"
            ? "bg-green-100 text-green-700"
            : reg.status === "Pending"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700"
        }`}>
          {reg.status}
        </span>

        <button
          onClick={() => deleteRegulation(reg.id)}
          className="text-red-500 text-sm"
        >
          Delete
        </button>

      </div>

    </div>
  );
}